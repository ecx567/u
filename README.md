
RESUMEN
El presente proyecto propone el diseño e implementación de un sistema automático de riego para cultivos mediante el uso de una plataforma basada en microcontroladores y una interfaz web de monitoreo y control. El propósito principal es optimizar el consumo de agua en entornos agrícolas mediante el monitoreo continuo de la humedad del suelo y la activación automática de bombas de riego solo cuando sea necesario. Para el desarrollo se empleó un microcontrolador Arduino UNO con sensor de humedad capacitivo, módulo relé, bomba de agua y un servidor web integrado que permite visualizar los valores del sistema y activar la bomba de forma manual o automática.
La metodología contempló el diseño electrónico del circuito, configuración de comunicaciones, programación del microcontrolador en Arduino y la construcción de una interfaz web accesible desde un navegador. Los resultados demuestran un funcionamiento estable del sistema, manteniendo la humedad del suelo en rangos óptimos y reduciendo consumos innecesarios de agua. Se concluye que el sistema constituye una solución funcional y escalable para la agricultura automatizada, con potencial de integración a sistemas de IoT para análisis estadístico y toma de decisiones más robustas.
Introducción
Descripción del problema
La agricultura enfrenta desafíos significativos relacionados con la eficiencia en el uso del agua, especialmente en un contexto de cambio climático y escasez hídrica creciente. Los sistemas de riego tradicionales dependen de la intervención manual y programación temporal, lo que frecuentemente resulta en desperdicio de agua por riego excesivo o pérdida de cultivos por riego insuficiente (Gutiérrez et al., 2014). La falta de monitoreo continuo de las condiciones del suelo impide una gestión óptima del recurso hídrico.




Justificación del proyecto
La implementación de sistemas de riego automatizados basados en sensores representa una solución viable y económica para optimizar el consumo de agua en la agricultura. La tecnología Arduino permite desarrollar prototipos funcionales de bajo costo que pueden adaptarse a diferentes escalas de producción agrícola. La integración de una interfaz web proporciona accesibilidad remota, permitiendo a los usuarios monitorear y controlar el sistema desde cualquier dispositivo conectado a internet, facilitando la gestión eficiente del riego sin necesidad de presencia física.
Objetivo general
Diseñar e implementar un sistema automatizado de riego con interfaz web basado en Arduino Uno que permita el control y monitoreo remoto de la humedad del suelo para optimizar el uso del agua en aplicaciones agrícolas.
Objetivos específicos
Implementar un circuito electrónico que integre Arduino Uno, sensor capacitivo de humedad, módulo relé y bomba de agua para automatizar el proceso de riego.
Desarrollar un algoritmo de control que active la bomba automáticamente según los niveles de humedad del suelo detectados por el sensor capacitivo.
Crear una interfaz web que se comunique mediante puerto serial con Arduino para visualizar datos en tiempo real y permitir control manual del sistema.
Realizar pruebas de funcionamiento que validen la eficiencia y confiabilidad del sistema implementado.
Metodología empleada
El desarrollo del proyecto se estructuró en fases secuenciales: diseño del circuito electrónico, selección e integración de componentes hardware, desarrollo del firmware para Arduino Uno, implementación de la interfaz web con comunicación serial, y finalmente pruebas de validación del sistema completo en condiciones controladas.




Fundamentación teórica
La automatización agrícola se sustenta en la integración de sensores, controladores y sistemas de comunicación en tiempo real. Los sensores de humedad de suelo permiten medir el contenido de agua mediante variaciones de conductividad eléctrica, información que es procesada por microcontroladores como el Arduino UNO para activar o desactivar un actuador (bomba o válvula) de manera inteligente (Nayyar & Puri, 2016).
4.1 Principios de circuitos eléctricos y electrónicos
Los circuitos electrónicos constituyen la base funcional de los sistemas de control automatizado. Un circuito eléctrico es un camino cerrado por el cual fluyen electrones desde una fuente de energía a través de diversos componentes que realizan trabajo útil, como sensores, actuadores y controladores (Floyd, 2007). En el contexto del riego automatizado, el circuito integra elementos de entrada (sensor de humedad), procesamiento (microcontrolador Arduino) y salida (relé y bomba).
La Ley de Ohm (V = I × R) y las leyes de Kirchhoff fundamentan el análisis de los circuitos, permitiendo calcular corrientes, voltajes y resistencias necesarias para el correcto funcionamiento de cada componente (Floyd, 2007). El diseño del circuito debe considerar las especificaciones eléctricas de cada elemento para garantizar compatibilidad y seguridad operacional.
Sensores de humedad
Estos dispositivos entregan una lectura analógica cuyo valor es interpretado como porcentaje de humedad. Su funcionamiento se basa en principios de conductividad eléctrica entre dos electrodos enterrados en el suelo (Nayyar & Puri, 2016).
Los sensores capacitivos de humedad miden el contenido de agua en el suelo mediante la variación de la capacitancia del medio. A diferencia de los sensores resistivos, los capacitivos no tienen contacto directo del electrodo con el suelo, lo que reduce significativamente la corrosión y aumenta su vida útil (Bogena et al., 2017).
4.3 Módulos relé y control de cargas AC/DC
El módulo relé es un interruptor electromagnético que permite controlar cargas de alta potencia mediante señales de bajo voltaje provenientes del microcontrolador. Los relés contienen una bobina que al energizarse genera un campo magnético que atrae un contacto mecánico, cerrando o abriendo el circuito de potencia de forma aislada del circuito de control (Hughes, 2016).
Los módulos relé para Arduino típicamente operan con señales de 5V en la bobina y pueden conmutar cargas de hasta 250VAC/10A o 30VDC/10A en sus contactos. Incluyen diodos de protección, LED indicador y optoacoplador para aislamiento galvánico, protegiendo el microcontrolador de transitorios eléctricos y ruido de la carga (Hughes, 2016). Esta característica es fundamental para controlar bombas de agua que operan con voltajes superiores a los que Arduino puede manejar directamente.
4.4 Microcontrolador Arduino Uno
Arduino Uno es una plataforma de hardware libre basada en el microcontrolador ATmega328P de Atmel. Posee 14 pines digitales de entrada/salida, 6 entradas analógicas con conversor ADC de 10 bits, 32KB de memoria flash, 2KB de SRAM y opera a 16MHz (Banzi & Shiloh, 2015). Su arquitectura permite la lectura de sensores analógicos, procesamiento de algoritmos de control y activación de actuadores mediante salidas digitales.
La programación se realiza mediante el entorno Arduino IDE utilizando un lenguaje basado en C/C++ simplificado. El microcontrolador ejecuta el código de forma secuencial en un bucle infinito, leyendo entradas, ejecutando lógica de control y actualizando salidas continuamente (Banzi & Shiloh, 2015). La comunicación serial mediante el puerto USB permite intercambio bidireccional de datos con una computadora u otros dispositivos a velocidades configurables entre 300 y 115200 baudios.
4.5 Comunicación serial y interfaz web
La comunicación serial es un protocolo de transmisión de datos que envía información bit por bit a través de un canal de comunicación, siendo uno de los métodos más utilizados para conectar microcontroladores con computadoras (Monk, 2017). Arduino Uno implementa comunicación serial mediante UART (Universal Asynchronous Receiver-Transmitter) a través de los pines digitales 0 (RX) y 1 (TX), accesibles también mediante el puerto USB.
La interfaz web puede comunicarse con Arduino mediante tecnologías como Node.js con la biblioteca serialport, Python con PySerial, o aplicaciones web progresivas que utilizan la Web Serial API. Esta arquitectura permite que navegadores modernos accedan directamente al puerto serial, facilitando el monitoreo y control del sistema sin requerir software adicional (Monk, 2017).
4.6 Diagrama de bloques funcional
El sistema se estructura en cuatro bloques funcionales principales:
Bloque de Sensado: Sensor capacitivo de humedad que mide continuamente el contenido de agua del suelo y genera una señal analógica proporcional.
Bloque de Procesamiento: Arduino Uno que lee la señal del sensor mediante entrada analógica, ejecuta algoritmos de decisión comparando con umbrales predefinidos, y genera señales de control.
Bloque de Potencia: Módulo relé que actúa como interfaz entre la señal de control digital (5V) y la bomba de agua (voltaje mayor), conmutando la alimentación de la bomba según las órdenes del microcontrolador.
Bloque de Interfaz: Comunicación serial bidireccional que transmite datos del sensor y estado del sistema hacia la interfaz web, y recibe comandos de control manual desde el usuario.




1. Materiales y métodos
5.1 Materiales y componentes
Hardware principal:
1 Arduino Uno (microcontrolador ATmega328P, 16MHz, 5V)
1 Sensor capacitivo de humedad del suelo v1.2 
1 Módulo relé de 1 canal 5V (10A/250VAC)
1 Bomba de agua sumergible
Componentes electrónicos:
Cables jumper macho-macho y macho-hembra
Materiales de prueba:
Recipiente para sustrato (maceta)
Sustrato o tierra para pruebas
Recipiente para reservorio de agua
5.2 Herramientas de software
Desarrollo del firmware:
Arduino IDE 2.3.2
Biblioteca Arduino
Biblioteca LiquidCrystal
Desarrollo de la interfaz web:
Visual Studio Code
HTML5, CSS3
Web Serial API (para comunicación serial desde navegador)
Biblioteca pyserial en Python
Herramientas de diseño y simulación:
Fritzing (diseño de diagramas de conexión)
5.3 Metodología de desarrollo
5.3.1 Diseño del circuito
El diseño del circuito se basó en tres subsistemas interconectados:
Subsistema de sensado: El sensor capacitivo de humedad se conectó a la entrada analógica A0 de Arduino. El pin VCC del sensor se conectó a 5V, GND a tierra común, y la salida analógica (AOUT) a A0. Este sensor genera un voltaje entre 0-3.3V inversamente proporcional a la humedad (mayor voltaje = menor humedad).
Subsistema de control: Arduino Uno procesa la señal analógica mediante su conversor ADC de 10 bits, obteniendo valores entre 0-550. Un algoritmo de control compara el valor leído con umbrales establecidos (por ejemplo, valor > 500 indica suelo seco, < 275 indica suelo húmedo) y toma decisiones de activación/desactivación de la bomba.
Subsistema de potencia: El módulo relé se conectó al pin digital D7 de Arduino (señal de control), con alimentación desde 5V y GND. La bomba de agua se conectó en el circuito de potencia del relé (contactos NO y COM), alimentada por una fuente independiente de 5V para aislar el consumo de corriente del sistema Arduino.
5.3.2 Montaje físico
El montaje siguió la siguiente secuencia:
Preparación de la plataforma: Se utilizó una base para fijar Arduino Uno y el módulo relé, manteniendo separación adecuada para evitar interferencias.
Conexión del sensor: Se realizaron las conexiones del sensor capacitivo según el siguiente esquema:
VCC sensor → 5V Arduino
GND sensor → GND Arduino
AOUT sensor → A0 Arduino
Conexión del módulo relé:
VCC relé → 5V Arduino
GND relé → GND Arduino
IN relé → D7 Arduino (señal de control)
COM relé → Positivo fuente bomba
NO relé → Positivo bomba
Negativo bomba → Negativo fuente bomba
Verificación de continuidad: Antes de energizar, se verificaron todas las conexiones con multímetro para evitar cortocircuitos.
Instalación del sensor: El sensor se insertó verticalmente en el sustrato, evitando tocar el circuito impreso con agua para prevenir daños.