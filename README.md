# 💰 GastoApp Pro

[![Demo en vivo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge)](https://coderhouse2025-droid.github.io/App/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)](https://coderhouse2025-droid.github.io/App/)
[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-yellow?style=for-the-badge)](LICENSE)

> Controlá tu dinero como un pro — simple, visual y desde cualquier dispositivo.

<img width="1698" height="926" alt="Mockup" src="https://github.com/user-attachments/assets/6901bac9-4e05-471b-aad2-d145dbb21346" />


🌐 **Demo:** https://coderhouse2025-droid.github.io/App/

---

## 📋 Índice

- [Descripción del producto](#-descripción-del-producto)
- [Caso de negocio](#-caso-de-negocio)
- [Decisiones técnicas y su justificación](#-decisiones-técnicas-y-su-justificación)
- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Pipeline de datos: del input sucio al dashboard limpio](#-pipeline-de-datos-del-input-sucio-al-dashboard-limpio)
- [¿Por qué este camino y no otro?](#-por-qué-este-camino-y-no-otro)
- [Features](#-features)
- [Instalación](#️-instalación)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Roadmap](#-roadmap)

---

## 📊 Descripción del producto

**GastoApp Pro** es una aplicación web progresiva (PWA) para gestión personal de finanzas. Permite registrar ingresos y gastos, visualizar la situación financiera en tiempo real mediante gráficos dinámicos, filtrar por período y exportar reportes PDF profesionales — **todo desde el navegador, sin backend, sin cuentas, sin fricción**.

---

## 💼 Caso de negocio

### El problema que resuelve

El usuario objetivo es una persona que quiere llevar un control simple de sus gastos sin instalar apps nativas, sin crear cuentas en servicios de terceros, y sin pagar suscripciones. En Argentina y Latinoamérica, el contexto inflacionario hace crítico el monitoreo mensual del gasto real vs. el presupuesto disponible.

El dolor principal no es la falta de apps financieras — es la **fricción de adopción**: las apps nativas requieren descarga, registro y permisos. Las herramientas profesionales (YNAB, Fintual, Quipu) tienen curvas de aprendizaje altas o son de pago.

### La propuesta de valor

- **Cero fricción de entrada**: se abre en el navegador, no requiere cuenta
- **Privacidad total**: los datos nunca salen del dispositivo del usuario
- **Experiencia app nativa**: instalable como PWA en móvil y desktop
- **Portabilidad**: exportación PDF para compartir o archivar sin depender de la app

---

## 🧠 Decisiones técnicas y su justificación

### 1. HTML + JavaScript Vanilla — no React, no Vue

**¿Por qué Vanilla JS?**

Para una SPA de esta escala (una pantalla, sin routing, sin estado complejo compartido), introducir un framework como React o Vue hubiera sido sobreingeniería. React añade ~45KB de bundle base más el overhead del Virtual DOM para una app que maneja como máximo cientos de transacciones locales.

El argumento de negocio es directo: **menos bytes = carga más rápida = mejor experiencia en conexiones móviles lentas**, que es exactamente el perfil del usuario objetivo en contextos emergentes.

Además, Vanilla JS garantiza que el proyecto no quede desactualizado por cambios de versión en frameworks. Una app financiera personal debe poder ejecutarse igual en 5 años.

**¿Cuándo elegiría React en su lugar?**
Si la app tuviera múltiples vistas, manejo de estado global complejo (múltiples cuentas, usuarios, sincronización), o un equipo trabajando en paralelo sobre componentes, React sería la elección correcta. Para este scope, no.

---

### 2. TailwindCSS — no CSS propio, no Bootstrap

**¿Por qué Tailwind?**

El objetivo era una UI moderna y consistente sin dedicar tiempo a escribir y mantener hojas de estilo. Tailwind via CDN resuelve esto con utilidades atómicas directamente en el markup.

Comparado con Bootstrap: Tailwind no impone un sistema de diseño visual específico (el "look Bootstrap" es reconocible y genérico). Tailwind permite construir una identidad visual propia con el mismo nivel de productividad.

**Trade-off aceptado:** En producción, Tailwind via CDN descarga el CSS completo (~3MB sin purgar). Para una PWA que funciona offline después de la primera carga, esto es aceptable: el Service Worker cachea los assets en la instalación inicial, y las visitas subsiguientes no hacen requests de red.

---

### 3. Chart.js — no D3, no Recharts

**¿Por qué Chart.js?**

Para los requerimientos de visualización de esta app (un gráfico de donut por categoría, indicadores de uso), Chart.js es la herramienta justa. D3 es extremadamente poderoso pero requiere manipulación manual del DOM SVG — es la elección correcta para visualizaciones complejas y bespoke, no para un donut chart estándar.

Chart.js ofrece animaciones suaves out-of-the-box, soporte responsive nativo, y una API declarativa simple. El bundle (~60KB minificado) es proporcional al valor que entrega.

**Argumento de negocio:** El gráfico de donut por categoría no es decorativo — es la visualización que le permite al usuario identificar en segundos qué categoría consume más su presupuesto. Esa respuesta visual inmediata es el núcleo del valor del dashboard.

---

### 4. jsPDF + AutoTable — exportación sin servidor

**¿Por qué generar el PDF en el cliente?**

La alternativa era un microservicio en el backend que reciba los datos y retorne un PDF. Eso requiere infraestructura, costos de hosting, y levanta la pregunta de privacidad: ¿por qué enviar datos financieros personales a un servidor externo?

jsPDF ejecuta la generación 100% en el browser. El PDF resultante tiene formato profesional (encabezado, tabla de movimientos, resumen financiero) y puede compartirse o archivarse sin dependencia de la app.

**Trade-off:** jsPDF no alcanza la calidad tipográfica de herramientas server-side como WeasyPrint o Puppeteer. Para un reporte financiero personal, la calidad que entrega es más que suficiente.

---

### 5. LocalStorage — no IndexedDB, no backend

**¿Por qué LocalStorage?**

El volumen de datos es predeciblemente pequeño: un usuario promedio registra entre 20 y 200 transacciones por mes. LocalStorage soporta hasta ~5MB por origen — suficiente para años de historial de esta app.

IndexedDB hubiera sido la elección si manejáramos: grandes volúmenes de datos, queries complejas, o datos binarios. Para key-value storage de un array JSON de transacciones, LocalStorage es directo y no requiere abstracción.

**Riesgo asumido:** LocalStorage puede ser borrado por el usuario (limpiar caché del browser) o por el sistema operativo en dispositivos con poco espacio. Se documenta este riesgo en el Roadmap como motivación para la futura migración a persistencia en la nube.

---

### 6. PWA con Service Worker — no app nativa

**¿Por qué PWA?**

El deployment como PWA elimina la barrera de la tienda de apps (App Store / Play Store): sin proceso de revisión, sin comisiones, actualizable instantáneamente. El usuario puede instalar la app desde el browser con un solo tap.

El Service Worker implementa una estrategia **Cache First** para los assets estáticos (HTML, CSS, JS, iconos), lo que garantiza funcionamiento offline completo después de la primera visita. Esto es crítico para el caso de uso: registrar un gasto en el momento en que ocurre, aunque no haya conexión.

---

## 🏗️ Arquitectura del proyecto

```
GastoApp Pro
│
├── Capa de presentación (index.html)
│   ├── Dashboard (KPIs en tiempo real)
│   ├── Formulario de carga (ingresos / gastos)
│   ├── Listado de movimientos con filtros
│   └── Visualización (Chart.js — donut por categoría)
│
├── Capa de lógica (JavaScript Vanilla — inline en index.html)
│   ├── Gestión de estado (array en memoria + sync a LocalStorage)
│   ├── Motor de cálculo (balance, porcentajes, totales por categoría)
│   ├── Pipeline de datos (ver sección siguiente)
│   └── Generador de reportes PDF (jsPDF)
│
└── Capa de infraestructura
    ├── LocalStorage (persistencia local)
    ├── Service Worker (cache offline + instalación PWA)
    └── Web App Manifest (metadatos PWA: nombre, iconos, colores)
```

La decisión de mantener la lógica en un único archivo `index.html` es deliberada para este scope: simplifica el deployment (un solo archivo a servir), elimina la necesidad de un bundler, y hace el código auditable de un vistazo. Si la app creciera en complejidad, el siguiente paso sería separar en módulos ES con un bundler liviano como Vite.

---

## 🔄 Pipeline de datos: del input sucio al dashboard limpio

Uno de los desafíos ocultos de una app financiera es que **el input del usuario es intrínsecamente sucio**. Se documentan aquí las transformaciones aplicadas y su justificación.

### Problema 1: Montos con formato inconsistente

El usuario puede ingresar `1.500`, `1500`, `1,500` o `1500.50`. El motor de JavaScript parsea `1.500` como `1.5` (punto decimal), no como mil quinientos.

**Transformación aplicada:**
```javascript
// Normalización de monto antes de guardar
function parseMonto(input) {
  // Remover separadores de miles (puntos si hay 3 dígitos después)
  // Convertir coma decimal a punto
  return parseFloat(
    input.toString()
      .replace(/\./g, '')   // eliminar puntos (sep. de miles en AR)
      .replace(',', '.')     // convertir coma decimal
  );
}
```

**Justificación:** En Argentina, la convención de formato numérico usa punto como separador de miles y coma como decimal (1.500,50). Si no se normaliza, el 80% de los usuarios ingresaría montos incorrectos sin saberlo.

---

### Problema 2: Categorías duplicadas por capitalización

Un usuario puede crear `alimentación`, `Alimentación` y `ALIMENTACIÓN` como categorías distintas. El gráfico mostraría tres barras para lo que es la misma categoría.

**Transformación aplicada:**
```javascript
// Normalización de categoría al guardar y al agrupar
categoria.trim().toLowerCase()
```

**Justificación:** El agrupamiento por categoría es la operación analítica central del dashboard. Sin esta normalización, los totales por categoría quedan fragmentados y el gráfico pierde su valor.

---

### Problema 3: Fechas sin validación de rango

El filtro por mes/año opera sobre el campo `fecha` de cada transacción. Si el usuario ingresa una fecha inválida (ej: 31 de febrero), la comparación produce resultados inconsistentes.

**Transformación aplicada:**
```javascript
// Validación antes de guardar
const fechaObj = new Date(fecha);
if (isNaN(fechaObj.getTime())) {
  // Mostrar error, no guardar
  return;
}
```

---

### Problema 4: Balance negativo no señalizado

Un saldo negativo en contextos financieros no es un error técnico, pero debe comunicarse visualmente de forma diferente a un saldo positivo. El sistema de indicadores usa tres estados:

| Estado | Condición | Color |
|--------|-----------|-------|
| Normal | Gastos < 70% de ingresos | Verde |
| Warning | Gastos entre 70% y 90% | Amarillo |
| Danger | Gastos > 90% o balance negativo | Rojo |

**Justificación:** Este sistema de semáforo traduce un dato numérico abstracto en una señal accionable. El usuario no necesita calcular porcentajes — el color le dice si necesita actuar.

---

## 🤔 ¿Por qué este camino y no otro?

### Alternativa descartada: Next.js + Prisma + PostgreSQL

Una arquitectura full-stack con SSR, base de datos relacional y autenticación hubiera entregado persistencia en la nube, multi-dispositivo y historial ilimitado. También hubiera requerido: hosting de servidor, costos mensuales, gestión de seguridad de datos financieros, y un tiempo de desarrollo 5x mayor.

Para el MVP y el perfil del proyecto (herramienta personal, académica, sin usuarios en producción), el costo/beneficio no justifica esta complejidad. El Roadmap documenta esta evolución como paso futuro natural.

### Alternativa descartada: Firebase Realtime Database

Firebase resolvería la sincronización multi-dispositivo con muy poco código. El trade-off: dependencia de un servicio externo (Google), potencial vendor lock-in, y — más importante para este caso de uso — los datos financieros del usuario pasarían por servidores de terceros. La decisión de priorizar privacidad local es coherente con el valor de "sin backend, sin cuentas".

### Alternativa descartada: React Native / Capacitor

Una app nativa o híbrida daría acceso a APIs del sistema operativo (notificaciones push, biometría). Para las funcionalidades actuales, el overhead de mantenimiento de una app nativa no es justificable. La PWA cubre el 95% del caso de uso con el 20% de la complejidad.

---

## ✨ Features

- 📈 Dashboard financiero en tiempo real
- 💵 Registro de ingresos y gastos con categorías
- 🧠 Balance automático y porcentaje de presupuesto utilizado
- 📊 Gráfico dinámico donut por categoría (Chart.js)
- 🚦 Indicadores de estado: normal / warning / danger
- 📅 Filtro por mes y año
- 📄 Exportación a PDF profesional con tabla de movimientos
- 💾 Persistencia con LocalStorage (sin cuentas, sin backend)
- 📱 Instalable como app (PWA) en móvil y desktop
- ✈️ Funciona offline después de la primera carga
- 🎨 UI moderna con TailwindCSS + animaciones

---

## 🛠️ Instalación

```bash
git clone https://github.com/coderhouse2025-droid/App.git
cd App
```

Abrir directamente:
```
index.html
```

Para habilitar el Service Worker (requiere HTTPS o localhost):
```bash
npm install -g live-server
live-server
```

La app estará disponible en `http://localhost:8080`. El Service Worker se registra automáticamente y la app es instalable como PWA desde el menú del browser.

---

## 📁 Estructura del proyecto

```
/
├── index.html          # Aplicación completa (markup + lógica + estilos)
├── manifest.json       # Metadatos PWA (nombre, iconos, colores, modo standalone)
├── service-worker.js   # Cache offline (estrategia Cache First para assets estáticos)
├── icon-192.png        # Icono PWA 192x192 (requerido por Android)
├── icon-512.png        # Icono PWA 512x512 (requerido para splash screen)
└── README.md
```

**¿Por qué todo en index.html?**
Para un proyecto de este scope, la co-localización de markup, estilos y lógica en un solo archivo simplifica el deployment (sin build step, sin bundler) y la legibilidad del código para un evaluador externo. El trade-off de mantenibilidad a largo plazo se acepta conscientemente dado el contexto académico del proyecto.

---

## 🧩 Roadmap (Mejoras futuras)

Las siguientes mejoras están priorizadas en función del valor de negocio que agregarían:

| Prioridad | Mejora | Justificación |
|-----------|--------|---------------|
| Alta | ☁️ Persistencia en la nube (Firebase / Supabase) | Elimina el riesgo de pérdida de datos por limpieza de caché |
| Alta | 🔐 Autenticación de usuarios | Habilita multi-dispositivo y backup automático |
| Media | 📊 Comparativas mensuales | Permite identificar tendencias de gasto a lo largo del tiempo |
| Media | 🏦 Integración con APIs bancarias | Elimina la carga manual de transacciones |
| Baja | 🤖 Predicción de gastos con ML | Valor agregado diferenciador a largo plazo |

---

## 👨‍💻 Autor

**Juan Manuel Orellana**

---

## 📄 Licencia

MIT License — libre para uso, modificación y distribución.
