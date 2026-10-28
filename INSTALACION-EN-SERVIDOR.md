# Control de Calidad en la Edificación — Instalación en servidor

Guía para la organización que va a **alojar y controlar** la aplicación en sus
propios servidores. La aplicación es obra de **Mateo Moyá Borrás**.

## Qué es (y qué NO necesita)

- Es una **web estática**: archivos HTML, JavaScript y CSS. Se sirven tal cual.
- **No hay servidor que ejecutar, ni base de datos, ni backend.** No se instala
  nada en el servidor salvo los propios archivos.
- **No se guardan datos de usuarios en vuestro servidor.** Cada usuario entra con
  su cuenta de Google y sus obras se guardan en **su propio Google Drive**
  (carpeta «Control de Calidad»). La organización no almacena ni ve esos datos.

## Requisitos del alojamiento

- Un servidor web cualquiera (Apache, Nginx, IIS, o un alojamiento de solo
  estáticos) que sirva la carpeta por **HTTPS** (certificado válido).
  El guardado en Google Drive **exige https**; no funciona por http ni abriendo
  el archivo con doble clic.
- Que los `.js` se sirvan con su tipo normal (`application/javascript`); es lo
  predeterminado en todos los servidores.

## Puesta en marcha (una sola vez)

### 1. Crear vuestra identidad de Google (para que la posea la organización)

1. Entrad en <https://console.cloud.google.com> con la cuenta de Google de la
   organización y cread un proyecto (p. ej. «Control de Calidad»).
2. **API y servicios → Biblioteca →** buscad «Google Drive API» → **Habilitar**.
3. **Pantalla de consentimiento de OAuth →** tipo **Externo**. Rellenad nombre de
   la aplicación, logotipo, correo de asistencia, enlace a vuestra política de
   privacidad y dominio. (El permiso que usa la aplicación es `drive.file`, de
   los «no sensibles»: la verificación de Google es la más ligera.)
4. **Credenciales → Crear credenciales → ID de cliente de OAuth →** tipo
   **Aplicación web**. En **Orígenes autorizados de JavaScript** añadid la
   dirección EXACTA donde alojéis la aplicación, sin barra final, por ejemplo:
   `https://controlcalidad.tudominio.org`
5. Copiad el **ID de cliente** (termina en `.apps.googleusercontent.com`).

### 2. Poner vuestro ID de cliente en la aplicación

- Abrid el archivo **`config.js`** y pegad vuestro ID de cliente en
  `GOOGLE_CLIENT_ID`. **Es lo único que hay que tocar del código.**

### 3. Subir los archivos

- Copiad toda la carpeta a vuestro servidor web, en la ruta que servirá la
  dirección indicada en el paso 1.4. La página de entrada es
  `ControlCalidad.html`.

### 4. Abrir al público (cuando proceda)

- Mientras no esté verificada, solo podrán entrar las cuentas que añadáis como
  **«usuarios de prueba»**, y verán un aviso de Google del tipo «aplicación no
  verificada» (pulsan «Configuración avanzada → Continuar»).
- Para quitar ese aviso y abrirla a cualquiera, **publicad** la pantalla de
  consentimiento y completad la **verificación** de Google (con el dominio, el
  logotipo y la política de privacidad).

## Actualizaciones

- Para actualizar la aplicación, se sustituyen los archivos por la versión nueva.
  No hay que tocar nada más (vuestro `config.js` se conserva).

## Uso sin Google (opcional)

- La aplicación también funciona **sin Google**, guardando en una carpeta del
  ordenador (opción «Este ordenador»), en Chrome o Edge de escritorio. En ese
  modo no interviene ni el servidor ni Google. El modo Google Drive es el
  recomendado para móvil y para repartir mediante un enlace.
