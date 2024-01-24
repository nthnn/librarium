#define BUZZER 9
#define LED_LEVEL_1 2
#define LED_LEVEL_2 3
#define SENSOR_ECHO 6
#define SENSOR_TRIGGER 7

void singleBuzz();
void doubleBuzz();
void turnOffLed();
void switchLed(uint8_t level);
uint8_t detectObject();

unsigned long currentMillis = 0UL;
bool watchOut = false;

void setup() {
  pinMode(BUZZER, OUTPUT);

  pinMode(LED_LEVEL_1, OUTPUT);
  pinMode(LED_LEVEL_2, OUTPUT);

  pinMode(SENSOR_TRIGGER, OUTPUT);
  pinMode(SENSOR_ECHO, INPUT);

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
  tone(BUZZER, 1150);
  delay(280);
  noTone(BUZZER);
}

void doubleBuzz() {
  singleBuzz();
  delay(100);
  singleBuzz();
}

void turnOffLed() {
  digitalWrite(LED_LEVEL_1, LOW);
  digitalWrite(LED_LEVEL_2, LOW);
}

void switchLed(uint8_t level) {
  turnOffLed();

  switch(level) {
    case 2:
      digitalWrite(LED_LEVEL_2, HIGH);

    case 1:
      digitalWrite(LED_LEVEL_1, HIGH);

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
  digitalWrite(SENSOR_TRIGGER, LOW);
  delayMicroseconds(2);
  digitalWrite(SENSOR_TRIGGER, HIGH);
  delayMicroseconds(10);
  digitalWrite(SENSOR_TRIGGER, LOW);

  long duration = pulseIn(SENSOR_ECHO, HIGH);
  uint8_t distance = duration / 29 / 2;

  return distance;
}