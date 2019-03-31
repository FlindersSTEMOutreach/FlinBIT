#define ACCEL_X_PIN A5
#define ACCEL_Y_PIN A6
#define ACCEL_Z_PIN A7
#define LIGHT_LEVEL_PIN A4

// Display results on Serial Plotter

// the setup routine runs once when you press reset:
void setup()
{
    // initialize serial communication at 9600 bits per second:
    Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop()
{
    // Read accelerometer values
    int accelXValue = analogRead(ACCEL_X_PIN);
    int accelYValue = analogRead(ACCEL_Y_PIN);
    int accelZValue = analogRead(ACCEL_Z_PIN);

    // Read light sensor value
    int lightSensorValue = analogRead(LIGHT_LEVEL_PIN);

    // Print out values. Output will look like "X, Y, Z, light"
    Serial.print(accelXValue);
    Serial.print(", ");
    Serial.print(accelYValue);
    Serial.print(", ");
    Serial.print(accelZValue);
    Serial.print(", ");
    Serial.println(lightSensorValue); // last one must be a print*ln*!

    delay(100);        // delay in between reads for stability
}
