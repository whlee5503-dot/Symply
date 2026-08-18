# Política de Privacidad de Symply

**Última actualización: [FECHA A COMPLETAR AL PUBLICAR]**

Symply ("nosotros" o "la Aplicación") es una aplicación de seguimiento de síntomas crónicos
desarrollada por PublicHealth Tech Lab, operada por Won Ho. Esta Política de Privacidad explica
qué información recopilamos, cómo la utilizamos y las opciones que usted tiene.

Symply está diseñada para personas que gestionan condiciones crónicas como SOP (síndrome de
ovario poliquístico), endometriosis, fibromialgia, lupus, artritis reumatoide, enfermedad de
Crohn, síndrome del intestino irritable (SII) y encefalomielitis miálgica/síndrome de fatiga
crónica (EM/SFC). Debido a que la Aplicación maneja información relacionada con la salud,
tenemos especial cuidado en explicar claramente nuestras prácticas de datos.

**No mostramos anuncios y no vendemos sus datos, a nadie, nunca.**

---

## 1. Información que recopilamos

### 1.1 Información de la cuenta
Cuando inicia sesión con Google, recibimos su **nombre, dirección de correo electrónico y foto
de perfil** de Google, y Firebase Authentication asigna a su cuenta un identificador único
(UID). Usamos esto únicamente para identificar su cuenta y mantener sus datos vinculados a
usted en todos los dispositivos.

### 1.2 Datos de salud y síntomas
Estos son los datos principales que usted introduce en la Aplicación, incluyendo:
- Puntuaciones diarias de dolor y fatiga
- Registros de síntomas y notas
- Información sobre desencadenantes (dieta, sueño, estrés, clima, etc.)
- Datos del ciclo menstrual (si decide registrarlos)
- Las condiciones crónicas que selecciona en su perfil

Esta información se almacena de forma segura en nuestra base de datos en la nube (Firebase
Firestore) bajo su cuenta, de modo que se conserve incluso si pierde o cambia de teléfono, y
para que pueda acceder a ella desde cualquier dispositivo en el que inicie sesión.

### 1.3 Datos de uso y análisis
Utilizamos Firebase Analytics para comprender patrones generales de uso (por ejemplo, qué
pantallas se usan, con qué frecuencia se abre la Aplicación). Esto nos ayuda a mejorar la
Aplicación. Estos datos se agregan y no se utilizan para crear un perfil publicitario suyo.

### 1.4 Información de suscripción y pago
Si se suscribe a Symply Pro, nuestro procesador de pagos, Polar, recibe su **dirección de
correo electrónico** para procesar la transacción. **No recibimos ni almacenamos los datos de
su tarjeta de pago** — estos son gestionados enteramente por Polar.

---

## 2. Cómo utilizamos su información

Utilizamos la información descrita anteriormente para:
- Proporcionar y mantener la funcionalidad principal de seguimiento de síntomas
- Generar análisis de patrones e información mediante IA a partir de sus registros de síntomas
  (véase la Sección 3)
- Conservar sus datos en caso de reinstalación de la aplicación o cambio de dispositivo
- Procesar los pagos de suscripción
- Mejorar la Aplicación en función de tendencias de uso agregadas
- Responder a las solicitudes de soporte que nos envíe

**No** utilizamos sus datos de salud con fines publicitarios y **no** vendemos sus datos a
terceros.

---

## 3. Análisis mediante inteligencia artificial

Cuando solicita un análisis de patrones o un informe de información, la Aplicación envía sus
**registros de síntomas** (incluyendo puntuaciones de dolor/fatiga, fechas, notas, datos de
desencadenantes y, si los registró, datos del ciclo menstrual) a la API de Claude de Anthropic
para generar el análisis. Su nombre **no** se incluye en esta solicitud.

- Esta transmisión es **transitoria**: los datos se envían con el propósito de generar su
  informe y, según los términos de la API de Anthropic, no se utilizan para entrenar sus
  modelos ni se retienen de forma permanente más allá de lo necesario para procesar la
  solicitud y para fines estándar de registro operativo/seguridad a corto plazo.
- El análisis generado se devuelve a su dispositivo y, si lo guarda, se almacena en su cuenta
  según lo descrito en la Sección 1.2.
- Usted puede elegir si solicita o no el análisis de IA; no es automático.

Para más detalles sobre cómo Anthropic maneja los datos enviados a través de su API, consulte
la Política de Privacidad de Anthropic: https://www.anthropic.com/legal/privacy

---

## 4. Proveedores de servicios de terceros

Dependemos de los siguientes servicios de terceros para operar Symply. Cada uno actúa como
procesador de datos para el propósito específico descrito:

| Proveedor | Propósito | Datos involucrados |
|---|---|---|
| **Google Firebase** (Authentication, Firestore, Analytics) | Inicio de sesión, almacenamiento en la nube de sus registros, análisis de uso | Nombre, correo electrónico, foto de perfil, registros de síntomas, eventos de uso |
| **Anthropic (API de Claude)** | Análisis de patrones de síntomas generado por IA | Registros de síntomas (procesamiento transitorio, véase Sección 3) |
| **Polar** | Procesamiento de suscripciones/pagos | Dirección de correo electrónico (solo para el pago) |

Cada uno de estos proveedores tiene su propia política de privacidad que rige cómo manejan los
datos en nuestro nombre:
- Google/Firebase: https://firebase.google.com/support/privacy
- Anthropic: https://www.anthropic.com/legal/privacy
- Polar: https://polar.sh/legal/privacy

---

## 5. Transferencias internacionales de datos

Symply se desarrolla en la República de Corea, pero nuestros proveedores de servicios (Google
Firebase, Anthropic, Polar) procesan datos en servidores que pueden estar ubicados fuera de
Corea, incluido Estados Unidos. Al usar Symply, usted entiende que su información puede ser
procesada en países distintos al suyo, bajo las salvaguardas que mantiene cada proveedor.

---

## 6. Conservación de datos

Conservamos los datos de su cuenta y síntomas mientras su cuenta permanezca activa, de modo que
su historial longitudinal de síntomas permanezca disponible para usted y para cualquier médico
con quien decida compartirlo. Si elimina su cuenta (véase la Sección 7), eliminamos sus datos
asociados de nuestros sistemas activos, excepto cuando la conservación sea requerida por
motivos legales, de seguridad o de prevención de fraude.

---

## 7. Sus derechos y opciones

Usted puede:
- **Acceder** a sus datos en cualquier momento dentro de la Aplicación
- **Exportar** sus registros de síntomas (por ejemplo, como un informe en PDF para su médico)
- **Eliminar su cuenta y datos** contactándonos en el correo electrónico indicado abajo, o
  mediante la opción de eliminación de cuenta dentro de la aplicación, si está disponible
- **Optar por no usar el análisis de IA** simplemente no solicitándolo — registrar síntomas no
  requiere usar la función de análisis de IA

---

## 8. Privacidad de los menores

Symply no está dirigida a menores y no está destinada al uso por personas menores de 14 años.
No recopilamos conscientemente información de menores de 14 años. Si tomamos conocimiento de
que hemos recopilado dicha información, la eliminaremos.

---

## 9. Seguridad

Nos apoyamos en prácticas de seguridad estándar de la industria proporcionadas por nuestros
socios de infraestructura (reglas de seguridad de autenticación y base de datos de Google
Firebase, conexiones cifradas (HTTPS) para todos los datos en tránsito). Ningún método de
transmisión o almacenamiento es 100% seguro, pero trabajamos para proteger su información
mediante salvaguardas comercialmente razonables.

---

## 10. Cambios a esta política

Podemos actualizar esta Política de Privacidad de vez en cuando a medida que la Aplicación
evoluciona (por ejemplo, si añadimos nuevas funciones, idiomas o proveedores de servicios).
Actualizaremos la fecha de "Última actualización" indicada arriba cuando lo hagamos. El uso
continuado de la Aplicación después de que los cambios entren en vigor constituye la aceptación
de la política actualizada.

---

## 11. Contáctenos

Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos (acceso,
exportación, eliminación), contáctenos en:

**Correo electrónico**: contact@phtlab.org
**Desarrollador**: PublicHealth Tech Lab (Won Ho), Daejeon, República de Corea

---

*Este documento también está disponible en inglés (English) y coreano (한국어) — consulte los
enlaces en la Aplicación o en nuestro sitio web.*
