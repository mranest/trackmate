## TODO

### Client side

- Store last message received in browser LocalStorage
- Setup persistent session when connecting to MQTT, to get all missed messages

### IoT side

- Only post GNSS if position has changed more than x (100?) meters from last position
- Post at least once every 5 mins to keep MQTT connection alive; set CMQTTCONNECT 
keepalive_time to 600sec
- If position has not changed last 5 minutes go to deep sleep for 5mins; retain last 
position over deep sleep to be able to identify movement
- Change initialization code to only start MQTT connection if movement is detected 
(saves data when school bus is not moving and deep sleep is engaged)