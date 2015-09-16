# Demo de la introducción a Meteor

##Preset

 * Navegador en https://www.meteor.com/install
 * Terminal en /tmp
 * rm -rf chat-app

##Demo

### Instalar Meteor, crear la app y ejecutarlas

* Vamos a ver cómo instalar Meteor, las instrucciones para Linux, Mac y windows están en meteor.com/install. Se instala la herramienta Meteor y ya podemos crear y desplegar aplicaciones.

* Vamos a crear un proyecto llamado chat-app

```
meteor create chat-app
cd chat-app
ls
```

* Vemos que se han creado cada uno de los 3 tipos de ficheros que usaremos.
* La aplicación que se crea es muy básica. voy a *copiar el código* de la demo y continuamos.
* *atom .*
* Bien, ya está, ... *arrancamos* meteor
* Y vamos a localhost:3000 en el *navegador*

## HTML

* Aquí está nuestra app.
* El *CSS* es algo de lo que no va esta presentación, así que, por ahora, lo dejamos como está.
* Podéis ver cómo *el código html* se corresponde con lo que vemos en el navegador.
* Vamos a añadirle un título a nuestra app

```
<h1>Chat App</h1>
```
(save)

* Cuando le doy a guardar, Meteor detecta los cambios, reconstruye el código y lo envía al cliente. Lo llaman **hot code push** y es muy útil durante el desarrollo, pero, también en producción, porque nos permite enviar actualizaciones a los usuarios aunque estén usando la app, sin molestarles demasiado. (Según tengo entendido, a Apple no le gustaba esto de que las actualizaciones no pasaran por sus manos, pero ahora, ya no es un problema).

* (*footer*) En la parte de abajo hay un formulario para añadir los mensajes.

* Y en el medio irán los mensajes:
    * Aquí se usa la sintaxis para plantillas handlebars.
    * Recorremos la lista de mensajes usando `#each`, lista, que nos pasa JavaScript, como veremos.
    * Y todo estará conectado vía la base de datos.

## JS

* *Meteor.isClient* / *Meteor.isServer* - Lo primero que vamos a ver es que hay código para el cliente, para el servidor y para los dos (Podéis usar los directorios `client` y `server` para separar este código, lo veremos más adelante si queréis).

* Vamos a echar un vistazo al código desde el principio. Hay trozos comentados que iremos destapando después.

    Messages = new Mongo.Collection('msgs');

* Esta línea se ejecuta tanto en el servidor como en el cliente.
    * En el servidor, crea una colección en una base de datos MongoDB.
    * Y en el cliente, crea una colección *Minimongo* (un subconjunto sincronizado de la del servidor)
    * Minimongo es una implementación light de Mongo que usa la misma API que la versión del servidor y de esta forma se pueden usar las mismas funciones en los dos entornos.

*body.helpers*

* En la parte del cliente encontramos la función que proporciona la lista de mensajes que hemos visto en el HTML. A estas funciones se les llama ayudantes y son *reactivas*, es decir, se ejecutan automáticamente cada vez que cambian los datos que maneja.

    * *Template.body* es un objeto "Blaze" (la librería de Meteor para crear IU que renderiza las cosas en tiempo real) enganchado a la etiqueta *body*. Podemos crear nuestras propias plantillas además de usar alguna las etiquetas html.
    * Como véis, en la consulta se usa la misma sintaxis de MongoDB en el cliente, gracias a Minimongo.
    * Como veremos, obtendremos los mensages más recientes del servidor en orden cronológico inverso, pero aquí los reodenamos en orden cronológico.

*body.events*

* Por último tenemos la definición los eventos del objeto *Template.body* que queremos controlar, en este caso un *submit* en el formulario que, por ahora, sólo saca por la consola el texto que escribimos.


## Demostrar la conectividad con la base de datos en toda la pila

* Bien, pues, en realidad, ya lo tenemos casi todo ... Aún sin interfaz de usuario "funcional" (ya que el formulario no hace nada), sí que tenemos una app funcional.
* ¿Funcional ...? Vamos a verlo
* Aunque la interfaz de usuario no funcione, si que podemos usar Minimongo directamente desde la consola del navegador. Para para insertar un mensaje escribimos:

```
Messages.insert({username: 'consola', text: 'Hola desde la consola', createdAt: new Date()})
```

* Y mirar, está también en el DOM!, qué ha pasado aquí?
    * Cuando llamamos a la función insert de Minimongo, el cambio dispara un redibujado del DOM por parte de Blaze. Esto que estamos viendo es lo que hemos llamamos *reactividad*.
    * Además, ese insert se ha enviado de forma independiente al servidor que notificará, a su vez, a todos los clientes.

* Podemos hacer lo mismo, directamente sobre nuestra base de datos.

Go to *terminal*. new tab

```
meteor mongo
db.msgs.insert({text: 'Hola desde Mongo', createdAt: new Date, username: 'mongo'})
```

* Esto es una inserción en la BBDD completamente independiente y sin embargo, Meteor lo ha detectado. Esto es porque Meteor ve cualquier cosa que pasa en Mongo.
*  Así que, esta es una forma de integrar otras aplicaciones..
* Esto se hace si estar consultando constantemente (sin polling). En vez de eso, Meteor mira el "log de operaciones" de MongoDB’ o oplog.

*Seguridad en el cliente*

Antes de continuar vamos a detenernos en un aspecto de seguridad.

* Poder llamar a la función insert desde la consola podría acarrear ciertos problemas ya que ese insert va directo a la base de datos, sin que se haga ninguna comprobación por parte del servidor. ¿Qué pasa si un usuario se dedica a rellenarnos la base de datos de mensajes?

Por defecto, y para facilitar el desarrollo, los proyectos incluyen el paquete *insecure* que permite prototipar muy rápidamente sin tener que hacer consideraciones de seguridad como la validación de los datos, de usuarios, etc.

```
meteor list
meteor remove insecure
```

*Meteor methods*

Ahora, ya no funcionan los inserts (repetir comando en el navegador) y tenemos que crear *un método*. Los métodos son funciones que se llaman desde el cliente pero cuyo resultado es validado por el servidor.

* *Descomentar Meteor.methods*, como vemos, los métodos se definen para los dos entornos y en este caso, lo que hace es insertar un mensaje en la base de datos. Bien, pues ahora, ya podemos usar el método:

```
Meteor.call('sendMessage', 'hello from the browser console')
```

* Y bien, ahora si, por último, sólo nos queda habilitar la funcionalidad que le corresponde al formulario.
  * *Descomentar Meteor.call* y escribir un mensaje. *Por fin!*


*Meteor.publish/Meteor.subscribe*

Para continuar, necesitamos quitar el paquete autopublish, que, igual que insecure, y por las mismas razones, también viene por defecto. En este caso, lo que hace autopublish es eso, publicarlo todo, de forma que Minimongo es prácticamente Mongo.
Pero ... imaginaros si a la gente le gusta mucho nuestra app y empezamos a mover miles de mensajes, pues ... esto sería un problema para los navegadores de nuestros usuarios. Mejor lo quitamos:

```
meteor remove autopublish
```

Vaya, pues si que funciona! Minimongo se ha quedado vacío.

Para controlar los datos que se envían a los clientes, Meteor nos proporciona un sistema de Publicaciones/Subscripciones. Vamos a ver cómo funciona:

*Descomentar Meteor.publish*

    * Aquí, el servidor habilita una publicación llamada ”messages" (no confundir con la base de datos msgs), esto sería más bien como una colección "a la carta" de la colección Mongo:
    * Sería algo así como un punto de acceso o end-point de un servicio REST, excepto que está vivo, es decir que los cambios que afecten a esa consulta, se enviarán a los clientes en tiempo real.
    * La consulta se escribe como en Mongo y pide los últimos 5 mensajes (lo dejamos en 5 para hacerlo sencillo y no tener que paginar)

*Descomentar Meteor.subscribe*

    * Bien, pues entonces, el cliente sólo tiene que suscribirse a esa publicación y, por lo tanto, sólo tendrá acceso a esos 5 últimos mensajes, sin importar los que haya en el servidor. Uf!, pues, solucionado, ya gestionamos los mensajes que sean necesarios sin sobrecargar a los clientes.

(save) Ah!, bien, esto está mejor!

Pero, esperar que abra otro navegador ... (usar el modo privado para simular otro cliente) y enviar otro mensaje. "Hola, yo soy otro usuario"

*Pues entonces ... ya tenemos una aplicación para chatear!*

## Añadir cuentas de usuario

* Pero, claro, aún falta una cosa - todos los mensajes son anónimos. Así que, vamos a añadir un sistema de cuentas usando el sistema de paquetes de Meteor.

*terminal*

    meteor add accounts-ui accounts-password accounts-facebook

* Esto nos proporciona
    1. El sistema de cuentas de Meteor
    2. Un método de autenticación basado en contraseña
    3. Un método de autenticación basado oAuth a través de Facebook
* Al igual que nuestro código, los paquetes pueden añadir cosas a cliente y servidor de manera que pueden coordinar los elementos que se añaden a la interfaz de usuario con los que tienen que manejarlos desde el servidor y pueden gestionar su propio funcionamiento usando sus propias colecciones en la base de datos.

## Actualizar la app para usar las cuentas

* Bien, lo primero que tenemos que hacer es añadir el elemento que nos proporciona el sistema de cuentas para la IU y que debe permitir a los usuarios crear una cuenta, acceder, etc.
```
    {{> loginButtons}}
```
(save)

* Bien, aquí lo tenemos.
* Podéis ver que podemos configurar el acceso vía Facebook - de manera que hemos añadido oAuth a nuestra app en segundos - este proceso puede llevar semanas usando otros frameworks! Sólo queda configurarlo, que es muy fácil siguiendo las instrucciones que se muestran al pinchar en el botón. Pero ...
* En vez de eso ... vamos a usar el acceso basado en password.
* Aquí hay hay un campo de Email por lo que tendríamos que pasar por el proceso de confirmación ... vamos a hacerlo más sencillo.

*Descomentar `Accounts.config`* y ver cómo cambia Email por Username

* Y ademnás, queremos que, en vez de *anonymous*, se muestre nuestro nombre de usuario al escribir un mensaje:

*Cambiar* "anonymous" por Meteor.user().username

* Y además, no queremos que usuarios sin autenticar, puedan intentar escribir mensajes.

*Descomentar `Accounts.config`*

Demostrar desde la consola el error que sale al llamar al método.

* Y para acabar, dado que no pueden enviar mensajes, vamos a esconder el formulario para los usuarios que no están autenticados.

*html*
surround <form> element:
```
    {{#if currentUser}}
        (existing form)
    {{/if}}
```

* Esto es un simple `if`. Sólo se muestra el formulario si `currentUser` es algo verdadero.
* El ayudante `currentUser` devuelve el ID del usuario o si no, algo falso.
* Hemos visto desaparecer el formulario porque aún no estamos autenticados
* Y, ahora sí, esto es todo lo que necesitamos.

## Demo de la app funcionando
(crear 2 usuarios y enviar mensajes)

## Despliegue

* Guay, esta app es genial, vamos a enseñársela a nuestros colegas o, puede que a nuestros inversores!. Para desplegar la app sólo necesitamos una cuenta de desarrollador de Meteor
https://www.meteor.com/services/developer-accounts

*terminal*

```
meteor deploy elmejorchat1
```

(mientras tanto ...)

* Meteor nos proporciona un servidor gratuito para poder enseñar y compartir nuestras aplicaciones.
* Funcionará perfectamente para aplicaciones pequeñas y es *gratis para siempre*.
* Ahora mismo en beta, tenemos Galaxy. La versión pro y con la que Meteor pretende ganar dinero.
* Pero puedes ejecutar la app en cualquier sitio que soporte aplicaciones node.js.
* Bien, pues ya tenemos desplegada nuestra app. Si vamos la URL podemos jugar un poco con ella!

(dejar que la gente pruebe si quiere)

1. Si preferís usar vuestro propio servidor yo os recomiendo "meteor up", un sistema de despliegue igual de sencillo que todo lo demás en Meteor.

## Apps para móviles

* ¿Y qué pasa si ahora queremos vender nuestra app en la App Store o en la Play Store?, pues nada, darme un minuto ...
* Vamos a ver qué plataformas tenemos instalas ...

```
meteor list-platforms
```
* Vamos a añadir Android

```
meteor add-platform android
meteor run android --mobile-server elmejorchat1.meteor.com
```

* Ahora, Meteor está usando Cordova (o sea PhoneGap)
1. * Podéis usar lo que queráis, cámara, sensores, Bluetooth, con tan solo añadir el paquete Cordova correspondiente.
* Vamos a ver cómo va la app en el simulador
* Y listo para la Play Store.


Bien, *volvamos a la presentación par recopilar todos los conceptos que hemos visto en el código*


## Bootstrap

```
meteor add twbs:bootstrap
```

*html*
```
<div class="username"> <span class="label label-info">{{username}}</span> </div>
```

## Estructura de la app

```
mkdir client
touch client/main.js
touch client/main.html
mkdir server
touch server/publications.js
mkdir -p lib/collections
touch lib/
```
