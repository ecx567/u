# GitHub Copilot Instructions for Automated Irrigation System

## Project Context
This workspace contains an automated irrigation system project based on Arduino Uno.
- **Goal**: Monitor soil moisture and control a water pump automatically or via a web interface.
- **Documentation**: See `README.md` (in Spanish) for detailed hardware specs and theoretical background.

## Architecture
- **Hardware**:
  - **Controller**: Arduino Uno (ATmega328P).
  - **Sensors**: Capacitive Soil Moisture Sensor (Analog).
  - **Actuators**: 5V Relay Module controlling a Water Pump.
- **Software Stack**:
  - **Firmware**: C++ (Arduino).
  - **Frontend**: HTML5, CSS3, JavaScript (Web Serial API).
  - **Backend (Optional)**: Python (`pyserial`) if Web Serial API is not used.

## Hardware Configuration & Pinout
Strictly adhere to the following pin mapping as defined in the project design:
- **Moisture Sensor**: `A0` (Analog Input).
- **Relay Control**: `D7` (Digital Output).
- **Serial Communication**: USB (TX/RX on pins 0/1).

## Coding Conventions

### Firmware (Arduino)
- **Style**: Use standard C++ style for Arduino.
- **Naming**: Use English for code identifiers (variables, functions) even though documentation is in Spanish.
  - Example: `readMoisture()`, `pumpState`, `MOISTURE_THRESHOLD`.
- **Serial Protocol**:
  - Use a consistent baud rate (recommend `9600` or `115200`).
  - Send data in a structured format (e.g., JSON `{"moisture": 450, "pump": 1}` or CSV `450,1`) to simplify parsing in the web interface.
  - Implement non-blocking code (avoid `delay()`) using `millis()` for timing to ensure responsive serial communication.

### Web Interface
- **Connectivity**: Use the **Web Serial API** (`navigator.serial`) to communicate directly with the Arduino from the browser.
- **UI/UX**:
  - Display real-time moisture values and pump status.
  - Provide a "Connect" button to select the serial port.
  - Provide "Manual Override" controls for the pump.

## Logic & Control
- **Thresholds** (based on 10-bit ADC values 0-1023):
  - **Dry (Start Watering)**: Value > `500` (approx).
  - **Wet (Stop Watering)**: Value < `275` (approx).
  - *Note: Capacitive sensors often return higher analog values for dry soil and lower for wet soil. Verify calibration.*

## Safety & Robustness
- **Failsafes**: Implement a maximum run-time for the pump to prevent flooding or burnout if the sensor fails.
- **Debouncing**: Average sensor readings to prevent rapid toggling of the relay.
