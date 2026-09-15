Portafolio — [Erick Javier]

Portafolio profesional en HTML + Bootstrap 5 + CSS + JavaScript.
Estructura

web/                      -> Páginas HTML
  index.html               -> Página principal
  proyectos/
    proyecto-uno.html       -> Plantilla de caso de estudio (duplicar para cada proyecto)
assets/
  css/style.css            -> Todos los estilos (tokens de color, tipografía, componentes)
  js/main.js               -> Tema claro/oscuro, scroll reveal, validación de formulario
  img/projects/            -> Imágenes de proyectos

Cómo verlo

Opción simple: abrí web/index.html directo en el navegador (doble click).

Opción recomendada (evita problemas de rutas con algunos navegadores): usá la extensión Live Server de VS Code — click derecho sobre web/index.html → "Open with Live Server".
Dark mode

Se maneja con un atributo data-theme en <html> (ver assets/js/main.js) y variables CSS en assets/css/style.css (:root = claro, [data-theme="dark"] = oscuro). La preferencia se guarda en localStorage cuando el navegador lo permite.
Dependencias externas (por CDN, sin instalar nada)

    Bootstrap 5.3.3 — CSS y JS
    Bootstrap Icons — íconos (incluye GitHub, LinkedIn, WhatsApp)
    Google Fonts — Archivo, Inter, JetBrains Mono
