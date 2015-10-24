# Demo de la introducción a Meteor

##Preset

 * Navegador en https://www.meteor.com/install
 * Terminal en /tmp
 * rm -rf chat-app

##Demo

### Instalar Meteor, crear la app y ejecutarla

* Vamos a ver cómo instalar Meteor, las instrucciones para Linux, Mac y windows están en meteor.com/install. Se instala la herramienta Meteor y ya podemos crear y desplegar aplicaciones.
* Vamos a crear un proyecto llamado chat-app

```
meteor create chat-app --release 1.1.0.2
cd chat-app
ls
```

* Vemos que se han creado cada uno de los 3 tipos de archivos que usaremos.
* La aplicación que se crea es muy básica. Voy a *copiar el código* de la demo y continuamos.

```
atom .
```

* Bien, ya podemos *arancar* meteor y ver qué pinta tiene en el *navegador* localhost:3000

## HTML

* Bien, esta es nuestra app por ahora, pero vamos a convertirla en una app de chat completa, segura y escalable.
* El *CSS es algo de lo que no va esta presentación*, así que, por ahora, lo dejamos como está. Algunas animaciones y media-queries ...

* Podéis ver cómo *el HTML* se corresponde con lo que vemos en el navegador.
* Venga, vamos a añadir un título en la cabecera:

```
<h1>Chat App</h1>
```
(save)

* Cuando le doy a guardar, Meteor detecta los cambios, reconstruye el código y lo envía al cliente.
* Lo llaman **hot code push** o *actualizaciones en caliente* y es muy útil durante el desarrollo, pero, también en producción, puesto  que nos permite enviar actualizaciones a los usuarios aunque estén usando la app y, sin molestarles demasiado.

* (*footer*) En la parte de abajo hay un formulario para añadir los mensajes.

* Y en el medio irán los mensajes:
    * Aquí se usa la sintaxis para plantillas handlebars.
    * Recorremos la lista de mensajes que, como veremos, nos pasa JavaScript.
    * Y todos estos datos estarán conectados vía la base de datos.

## JS

* *Meteor.isClient* / *Meteor.isServer* - Lo primero que vemos es que, en el mismo fichero tenemos código para cliente, servidor o para los dos.

* Vamos a echar un vistazo al código *desde el principio*. Hay trozos comentados que iremos destapando después.

**Messages = new Mongo.Collection('msgs')**

* Esta línea se ejecuta, como hemos visto, en los dos entornos:
    * En el servidor, crea una colección en una base de datos MongoDB.
    * Y en el cliente, crea una colección Minimongo, que es un subconjunto sincronizado de la del servidor.
    * Minimongo es una implementación light de Mongo pero que usa la misma API y de esta forma se pueden usar las mismas funciones en los dos entornos.

*body.helpers*

* En la parte del cliente encontramos la función que proporciona la lista de mensajes que hemos visto en el HTML.
* A estas funciones se les llama *ayudantes* y son *reactivas*, es decir, se ejecutan automáticamente cada vez que cambian los datos que manejan.
* Como véis, en la consulta se usa la misma sintaxis de MongoDB, gracias a Minimongo.
* Como veremos, obtendremos los mensages más recientes del servidor en orden cronológico inverso, pero aquí los reodenamos en orden cronológico.

*body.events*

* Por último tenemos la definición los eventos que queremos controlar.
* En este caso un *submit* en el formulario que, por ahora, sólo saca por la consola el texto que escribimos.

## Demostrar la conectividad con la base de datos en toda la pila

* Ya lo tendríamos casi todo si no fuera porque la interfaz de usuario no funciona, pero en realidad, sí que tenemos una app funcional.
* ¿Funcional ...? Vamos a verlo
* Podemos usar Minimongo directamente desde la consola del navegador para insertar mensajes:

```
Messages.insert({username: 'consola', text: 'Hola desde la consola', createdAt: new Date()})
```

* Y mirar, está también en el DOM!, qué ha pasado aquí?
* Cuando llamamos a la función insert de Minimongo, el cambio dispara un redibujado del DOM.
* Esto que estamos viendo es lo que hemos llamamos *reactividad*.
* Además, ese insert se ha enviado de forma independiente al servidor, que notificará a su vez, a todos los clientes.

* Podemos hacer lo mismo, directamente sobre nuestra base de datos.

Go to *terminal*. new tab

```
meteor mongo
db.msgs.insert({text: 'Hola desde Mongo', createdAt: new Date, username: 'mongo'})
```

* Esto es una inserción en la BBDD completamente independiente y sin embargo, Meteor lo ha detectado.
* Esto es porque Meteor ve cualquier cosa que pasa en Mongo a través de su log de operaciones.
* Y además, esta es una forma de integrar cualquier otra aplicación que pueda escribir en Mongo.

*Seguridad en el cliente*

Antes de continuar vamos a detenernos en un aspecto de seguridad.

* Dejar a los usuarios utilizar la función insert desde la consola del navegador, podría acarrear ciertos problemas, ya que, ese insert va directo a la base de datos, sin que se haga ninguna comprobación por parte del servidor. ¿Qué pasa si un usuario se dedica a rellenarnos la base de datos con mensajes de spam?

* Por defecto, y para facilitar el desarrollo, los proyectos incluyen el paquete *insecure* que permite prototipar muy rápidamente sin tener que hacer consideraciones de seguridad como la validación de los datos, de usuarios, etc.

```
meteor list
meteor remove insecure
```

*Meteor methods*

* Ahora, ya no funcionan los inserts (repetir comando en el navegador) y tenemos que crear *un método*.
* Los métodos son funciones que se llaman desde el cliente pero cuyo resultado es validado por el servidor.

* *Descomentar Meteor.methods*, como vemos, los métodos se definen para los dos entornos y, en este caso, lo que hace es insertar un mensaje en la base de datos.
* Bien, pues ahora, ya podemos usar el método:

```
Meteor.call('sendMessage', 'hello from the browser console')
```

* Y bien, ahora si, por último, sólo nos queda habilitar la funcionalidad que le corresponde al formulario.
  * *Descomentar Meteor.call* y escribir un mensaje. *Por fin!*


Escalado con *Meteor.publish/Meteor.subscribe*

* Antes de rematar ..., necesitamos quitar el paquete autopublish, que, al igual que insecure, y por las mismas razones, viene por defecto.
* En este caso, lo que hace autopublish es publicarlo todo, de forma que Minimongo es prácticamente Mongo.
* Pero ... imaginaros si a la gente le gusta mucho nuestra app y empezamos a mover miles de mensajes, pues ... esto sería un grave problema de escalado.
* Mejor lo quitamos:

```
meteor remove autopublish
```

* Vaya, pues si que funciona! Minimongo se ha quedado vacío.

* Afortunadamente, para controlar los datos que se envían a los clientes, Meteor nos proporciona un sistema de Publicaciones/Subscripciones.
* Veamos cómo funciona:

*Descomentar Meteor.publish*

    * Aquí, el servidor habilita una publicación llamada ”messages" (no confundir con la base de datos msgs), esto sería más bien como una colección "a la carta" de la colección principal:
    * La consulta se escribe como en Mongo y pide los últimos 5 mensajes (lo dejamos en 5 para hacerlo sencillo y no tener que paginar)

*Descomentar Meteor.subscribe*

    * Bien, pues entonces, el cliente sólo tiene que suscribirse a esa publicación y, por lo tanto, sólo tendrá acceso a esos 5 últimos mensajes, sin importar los que haya en el servidor.

(save) Ah!, bien, esto está mejor!

* Uf!, pues, solucionado, ya gestionamos los mensajes que sean necesarios sin problemas de escalado y sin sobrecargar a los navegadores de los clientes.

## Añadir cuentas de usuario

* Pero, claro, aún falta una cosa - todos los mensajes son anónimos. Así que, vamos a añadir un sistema de cuentas usando el sistema de paquetes de Meteor.

*terminal*

    meteor add accounts-ui accounts-password accounts-facebook

* Esto nos proporciona
    1. El sistema de cuentas de Meteor
    2. Un método de autenticación basado en contraseña
    3. Y un método de autenticación basado oAuth a través de Facebook

## Actualizar la app para usar las cuentas

* Sólo hay que añadir el elemento de la interfaz de usuario que permite a los usuarios crear una cuenta, acceder, etc. y que proporciona el paquete accounts-ui:
```
    {{> loginButtons}}
```
(save)

* Bien, aquí lo tenemos.
* Podéis ver que podemos configurar el acceso vía Facebook - algo que puede llevar semanas usando otros frameworks!
* En vez de eso ... vamos a usar el acceso basado en password.
* Aquí hay hay un campo de Email por lo que tendríamos que pasar por el proceso de confirmación ... vamos a hacerlo más sencillo.

* *Descomentar `Accounts.config`* y ver cómo cambia Email por Username
(save)

* Queremos que, en vez de *anonymous*, se muestre nuestro nombre de usuario al escribir un mensaje: *Cambiar "anonymous" por Meteor.user().username*
(save)

* No queremos que usuarios no autenticados puedan enviar mensajes: *Descomentar throw new Meteor.Error*
(save + demostrar)
* Y para acabar, dado que no queremos que usuarios no autenticados puedan enviar mensajes, vamos a esconderles el formulario.

*html*
surround <form> element:
```
    {{#if currentUser}}
        (existing form)
    {{/if}}
```
(save)

* Esto es un simple `if` que Sólo se muestra el formulario si `currentUser` existe

* Y, ahora sí, esto es todo lo que necesitamos.

## Demo de la app funcionando

(crear 2 usuarios y enviar mensajes)

o (seguir y hacerlo en la del despliegue)

## Despliegue

* Guay, esta app es genial, vamos a enseñársela a nuestros colegas o, puede que a nuestros inversores!.
https://www.meteor.com/services/developer-accounts

*terminal*

```
meteor deploy meetmobile924.meteor.com
```

(mientras tanto ...)

* Meteor nos proporciona un servidor gratuito para poder enseñar y compartir nuestras aplicaciones.
* Funcionará perfectamente para aplicaciones pequeñas y es *gratis para siempre*.
* Ahora mismo en beta, tenemos Galaxy que sería la versión pro y con la que Meteor pretende ganar dinero.
* Pero puedes ejecutar la app en cualquier sitio que soporte aplicaciones node.
* Bien, pues ya tenemos desplegada nuestra app. Si vamos la URL podemos jugar un poco con ella!

(dejar que la gente pruebe si quiere)

* Si preferís usar vuestro propio servidor yo os recomiendo "meteor up", un sistema de despliegue igual de sencillo que todo lo demás en Meteor.

## Apps para móviles

* ¿Y qué pasa si ahora queremos vender nuestra app en la App Store o en la Play Store?, pues nada, darme un minuto ...
* Vamos a ver qué plataformas tenemos instalas ...

```
meteor list-platforms
```
* Vamos a añadir Android

```
meteor add-platform android
meteor run android --mobile-server meetmobile924.meteor.com
```

* Ahora, Meteor está usando Cordova (o sea PhoneGap)
* Podéis usar lo que queráis, cámara, sensores, Bluetooth, con tan solo añadir el paquete Cordova correspondiente.
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
