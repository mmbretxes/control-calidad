// ===========================================================================
//  CONFIGURACIÓN DE LA APLICACIÓN   (editar solo este archivo)
// ===========================================================================
//
//  Aquí se indica la identidad de Google que la aplicación usa para que cada
//  usuario entre con su cuenta y guarde sus obras en SU PROPIO Google Drive.
//
//  Para que el guardado en Google Drive funcione en tu servidor, cambia el
//  valor de GOOGLE_CLIENT_ID por el de TU proyecto de Google. Pasos (una vez):
//
//   1. Entra en  https://console.cloud.google.com  con la cuenta de Google de
//      tu organización y crea un proyecto (p. ej. «Control de Calidad»).
//   2. «API y servicios» → «Biblioteca» → busca «Google Drive API» → Habilitar.
//   3. «Pantalla de consentimiento de OAuth» → tipo Externo → rellena el nombre
//      de la aplicación, el correo de asistencia y el de desarrollador. (Para
//      abrirla a todo el mundo sin avisos, más adelante hay que «Publicar» y
//      pasar la verificación de Google; mientras tanto, añade como «usuarios de
//      prueba» las cuentas que vayan a probarla.)
//   4. «Credenciales» → «Crear credenciales» → «ID de cliente de OAuth» →
//      tipo «Aplicación web». En «Orígenes autorizados de JavaScript» añade la
//      dirección web EXACTA donde alojes la aplicación, por ejemplo:
//          https://controlcalidad.tudominio.org
//      (sin barra final). Puedes añadir varias direcciones.
//   5. Copia el «ID de cliente» (termina en .apps.googleusercontent.com) y
//      pégalo abajo, entre las comillas.
//
//  No hace falca nada más: la aplicación son archivos estáticos (HTML, JS, CSS)
//  que se sirven por https. No hay servidor, ni base de datos: cada usuario
//  guarda en su propio Drive y tú no almacenas datos de nadie.
//
//  El ID de cliente NO es secreto (viaja dentro de la propia página web).
// ===========================================================================

window.APP_CONFIG = {

    // ← Pega aquí el ID de cliente de TU proyecto de Google.
    GOOGLE_CLIENT_ID: '157638865197-4epcbkhmil0gfn24m083ufi3a0i1323k.apps.googleusercontent.com',

    // Nombre de la carpeta que la aplicación crea en el Drive de cada usuario
    // para guardar dentro todas sus obras. Puedes cambiarlo si lo prefieres.
    CARPETA_RAIZ: 'Control de Calidad'

};
