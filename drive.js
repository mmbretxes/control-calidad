// ==========================================================================
// Guardado en Google Drive
// --------------------------------------------------------------------------
// Expone objetos "handle" (carpetas y archivos) con la MISMA interfaz que la
// File System Access API que ya usa la aplicación:
//   dir.getDirectoryHandle(nombre, {create}), dir.getFileHandle(nombre, {create}),
//   dir.values(), dir.removeEntry(nombre)
//   archivo.getFile() -> File,  archivo.createWritable() -> { write, close }
// Así el resto de la aplicación (guardado, carpetas de capítulo, documentos y
// fotos) funciona igual tanto en local como en Drive, sin reescribirlo.
//
// Alcance (scope) drive.file: la aplicación solo ve y gestiona los archivos y
// carpetas que ella misma crea. No puede leer el resto del Drive del usuario.
// ==========================================================================
(function () {
    'use strict';

    // El Client ID y el nombre de la carpeta se toman de config.js (único sitio a editar).
    const CFG = window.APP_CONFIG || {};
    const CLIENT_ID = CFG.GOOGLE_CLIENT_ID || '157638865197-4epcbkhmil0gfn24m083ufi3a0i1323k.apps.googleusercontent.com';
    const SCOPE = 'https://www.googleapis.com/auth/drive.file';
    const CARPETA_RAIZ = CFG.CARPETA_RAIZ || 'Control de Calidad';
    const CARPETA_MIME = 'application/vnd.google-apps.folder';
    const API = 'https://www.googleapis.com/drive/v3';
    const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

    let tokenClient = null, accessToken = null, tokenExp = 0;

    // ---------------------------------------------------------------- Autenticación (Google Identity Services)
    function cargarScript(src) {
        return new Promise((ok, err) => {
            if (document.querySelector(`script[src="${src}"]`)) return ok();
            const s = document.createElement('script');
            s.src = src; s.async = true; s.defer = true;
            s.onload = () => ok();
            s.onerror = () => err(new Error('No se pudo cargar ' + src));
            document.head.appendChild(s);
        });
    }

    async function asegurarGIS() {
        if (window.google && google.accounts && google.accounts.oauth2) return;
        await cargarScript('https://accounts.google.com/gsi/client');
        // El script tarda un instante en registrar google.accounts
        for (let i = 0; i < 50 && !(window.google && google.accounts && google.accounts.oauth2); i++) {
            await new Promise(r => setTimeout(r, 40));
        }
        if (!(window.google && google.accounts && google.accounts.oauth2)) throw new Error('Google Identity no disponible');
    }

    function pedirToken(interactivo) {
        return new Promise((resolve, reject) => {
            tokenClient.callback = (resp) => {
                if (resp && resp.error) return reject(new Error(resp.error));
                accessToken = resp.access_token;
                tokenExp = Date.now() + ((resp.expires_in || 3600) * 1000) - 60000;
                resolve(accessToken);
            };
            tokenClient.error_callback = (err) => reject(new Error((err && err.type) || 'token_error'));
            try { tokenClient.requestAccessToken({ prompt: interactivo ? '' : 'none' }); }
            catch (e) { reject(e); }
        });
    }

    async function token() {
        if (accessToken && Date.now() < tokenExp) return accessToken;
        try { return await pedirToken(false); }
        catch (e) { return await pedirToken(true); }
    }

    // ---------------------------------------------------------------- Llamadas REST a Drive (drv real)
    async function fetchApi(url, opts = {}) {
        const t = await token();
        const headers = Object.assign({}, opts.headers, { Authorization: 'Bearer ' + t });
        let r = await fetch(url, Object.assign({}, opts, { headers }));
        if (r.status === 401) { accessToken = null; headers.Authorization = 'Bearer ' + (await token()); r = await fetch(url, Object.assign({}, opts, { headers })); }
        if (!r.ok) throw new Error('Drive ' + r.status + ' ' + (await r.text().catch(() => '')));
        return r;
    }
    const escapaConsulta = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    function drvReal() {
        return {
            async buscarHijo(parentId, nombre, soloCarpeta) {
                let q = `'${parentId}' in parents and name='${escapaConsulta(nombre)}' and trashed=false`;
                if (soloCarpeta) q += ` and mimeType='${CARPETA_MIME}'`;
                const r = await fetchApi(`${API}/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType)&pageSize=10&spaces=drive`);
                const j = await r.json();
                return (j.files && j.files[0]) || null;
            },
            async listar(parentId) {
                const out = []; let pageToken = '';
                do {
                    const q = `'${parentId}' in parents and trashed=false`;
                    const u = `${API}/files?q=${encodeURIComponent(q)}&fields=nextPageToken,files(id,name,mimeType,modifiedTime)&pageSize=1000&orderBy=name` + (pageToken ? `&pageToken=${pageToken}` : '');
                    const j = await (await fetchApi(u)).json();
                    (j.files || []).forEach(f => out.push(f));
                    pageToken = j.nextPageToken || '';
                } while (pageToken);
                return out;
            },
            async crearCarpeta(parentId, nombre) {
                const r = await fetchApi(`${API}/files?fields=id,name,mimeType`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: nombre, mimeType: CARPETA_MIME, parents: [parentId] })
                });
                return await r.json();
            },
            async crearArchivo(parentId, nombre) {
                const r = await fetchApi(`${API}/files?fields=id,name`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: nombre, parents: [parentId] })
                });
                return await r.json();
            },
            async ponerContenido(id, blob, mime) {
                await fetchApi(`${UPLOAD}/files/${id}?uploadType=media&fields=id`, {
                    method: 'PATCH', headers: { 'Content-Type': mime || 'application/octet-stream' }, body: blob
                });
            },
            async descargar(id) {
                const r = await fetchApi(`${API}/files/${id}?alt=media`);
                return await r.blob();
            },
            async borrar(id) {
                await fetchApi(`${API}/files/${id}`, { method: 'DELETE' });
            },
            async carpetaEnRaiz(nombre) {
                let f = await this.buscarHijo('root', nombre, true);
                if (!f) f = await this.crearCarpeta('root', nombre);
                return f;
            }
        };
    }

    // ---------------------------------------------------------------- Handles (imitan la File System Access API)
    const mimePorNombre = (n) => {
        const e = (n.match(/\.([a-z0-9]+)$/i) || [, ''])[1].toLowerCase();
        return { json: 'application/json', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf',
            gif: 'image/gif', webp: 'image/webp', heic: 'image/heic', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }[e] || 'application/octet-stream';
    };
    function noEncontrado(nombre) { const e = new Error('No existe: ' + nombre); e.name = 'NotFoundError'; return e; }

    class DriveDirHandle {
        constructor(drv, id, name) { this.kind = 'directory'; this.drv = drv; this.id = id; this.name = name; }
        async getDirectoryHandle(nombre, o = {}) {
            let f = await this.drv.buscarHijo(this.id, nombre, true);
            if (!f) { if (!o.create) throw noEncontrado(nombre); f = await this.drv.crearCarpeta(this.id, nombre); }
            return new DriveDirHandle(this.drv, f.id, f.name || nombre);
        }
        async getFileHandle(nombre, o = {}) {
            const f = await this.drv.buscarHijo(this.id, nombre, false);
            if (f && f.mimeType !== CARPETA_MIME) return new DriveFileHandle(this.drv, f.id, f.name || nombre, this.id);
            if (f && f.mimeType === CARPETA_MIME) { const e = new Error('Es una carpeta'); e.name = 'TypeMismatchError'; throw e; }
            if (!o.create) throw noEncontrado(nombre);
            // Se crea de verdad en la primera escritura (id provisional null)
            return new DriveFileHandle(this.drv, null, nombre, this.id);
        }
        async removeEntry(nombre) {
            const f = await this.drv.buscarHijo(this.id, nombre, false);
            if (f) await this.drv.borrar(f.id);
        }
        async *entries() {
            const hijos = await this.drv.listar(this.id);
            for (const f of hijos) {
                yield [f.name, f.mimeType === CARPETA_MIME ? new DriveDirHandle(this.drv, f.id, f.name) : new DriveFileHandle(this.drv, f.id, f.name, this.id)];
            }
        }
        async *values() { for await (const [, v] of this.entries()) yield v; }
        async *keys() { for await (const [k] of this.entries()) yield k; }
        [Symbol.asyncIterator]() { return this.entries(); }
        async queryPermission() { return 'granted'; }
        async requestPermission() { return 'granted'; }
        async isSameEntry(o) { return !!o && o.id === this.id; }
    }

    class DriveFileHandle {
        constructor(drv, id, name, parentId) { this.kind = 'file'; this.drv = drv; this.id = id; this.name = name; this.parentId = parentId; }
        async getFile() {
            if (!this.id) throw noEncontrado(this.name);
            const blob = await this.drv.descargar(this.id);
            try { return new File([blob], this.name, { type: blob.type || mimePorNombre(this.name) }); }
            catch (e) { return blob; }
        }
        async createWritable() {
            const self = this; const partes = [];
            return {
                async write(d) { partes.push(d && d.data !== undefined ? d.data : d); },
                async truncate() {},
                async close() {
                    const blob = new Blob(partes, { type: mimePorNombre(self.name) });
                    if (!self.id) { const f = await self.drv.crearArchivo(self.parentId, self.name); self.id = f.id; }
                    await self.drv.ponerContenido(self.id, blob, mimePorNombre(self.name));
                }
            };
        }
        async queryPermission() { return 'granted'; }
        async requestPermission() { return 'granted'; }
        async isSameEntry(o) { return !!o && o.id === this.id && !!this.id; }
    }

    // ---------------------------------------------------------------- Fachada
    let drv = null, raizId = null, conectado = false;

    const DriveStore = {
        CLIENT_ID, CARPETA_RAIZ,
        estaConectado() { return conectado; },

        async conectar() {
            await asegurarGIS();
            if (!tokenClient) tokenClient = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPE, callback: () => {} });
            await pedirToken(true);
            drv = drvReal();
            raizId = (await drv.carpetaEnRaiz(CARPETA_RAIZ)).id;
            conectado = true;
            return true;
        },

        raiz() {
            if (!conectado) throw new Error('Drive no conectado');
            return new DriveDirHandle(drv, raizId, CARPETA_RAIZ);
        },

        // Punto de entrada para pruebas: inyecta un drv en memoria
        _usarDrvDePrueba(fakeDrv, fakeRaizId) { drv = fakeDrv; raizId = fakeRaizId; conectado = true; },
        _DriveDirHandle: DriveDirHandle,
        _DriveFileHandle: DriveFileHandle
    };

    window.DriveStore = DriveStore;
})();
