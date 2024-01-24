#define LED_LEVEL_1_PIN     2
#define LED_LEVEL_2_PIN     3

#define SENSOR_ECHO_PIN     6
#define SENSOR_TRIGGER_PIN  7

#define BUZZER_PIN          9

void singleBuzz();
void doubleBuzz();

void turnOffLed();
void switchLed(uint8_t level);

uint8_t detectObject();

unsigned long currentMillis = 0UL;
bool watchOut = false;

void setup() {
  pinMode(LED_LEVEL_1_PIN,    OUTPUT);
  pinMode(LED_LEVEL_2_PIN,    OUTPUT);
  pinMode(BUZZER_PIN,         OUTPUT);
  pinMode(SENSOR_TRIGGER_PIN, OUTPUT);
  pinMode(SENSOR_ECHO_PIN,    INPUT);

  Serial.begin(9600);
  while(!Serial);
}

void loop() {
  if(watchOut && millis() - currentMillis > 2000) {
    turnOffLed();

    watchOut = false;
    currentMillis = 0UL;
  }

  while(Serial.available()) {
    char msg = (char) Serial.read();

    if(msg == '0')
      switchLed(0);
    else if(msg == '3')
      turnOffLed();
  }

  if(detectObject() <= 6) {
    Serial.print(F("1"));

    char command = 0;
    currentMillis = millis();

    while(command != '1' && command != '2') {
      if(millis() - currentMillis > 2000) {
        currentMillis = 0UL;
        break;
      }

      command = (char) Serial.read();
    }

    if(command == 0) {
      delay(500);
      return;
    }
    else if(command == '1')
      switchLed(1);
    else if(command == '2')
      switchLed(2);
  }

  delay(500);
}

void singleBuzz() {
  tone(BUZZER_PIN, 1150);
  delay(280);
  noTone(BUZZER_PIN);
}

void doubleBuzz() {
  singleBuzz();
  delay(100);
  singleBuzz();
}

void turnOffLed() {
  digitalWrite(LED_LEVEL_1_PIN, LOW);
  digitalWrite(LED_LEVEL_2_PIN, LOW);
}

void switchLed(uint8_t level) {
  turnOffLed();

  switch(level) {
    case 2:
      digitalWrite(LED_LEVEL_2_PIN, HIGH);

    case 1:
      digitalWrite(LED_LEVEL_1_PIN, HIGH);

      currentMillis = millis();
      watchOut = true;

      break;
  }

  if(level == 2)
    doubleBuzz();
  else if(level == 1)
    singleBuzz();
}

uint8_t detectObject() {
  digitalWrite(SENSOR_TRIGGER_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(SENSOR_TRIGGER_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(SENSOR_TRIGGER_PIN, LOW);

  long duration = pulseIn(SENSOR_ECHO_PIN, HIGH);
  uint8_t distance = duration / 29 / 2;

  return distance;
}