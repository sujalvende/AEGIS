============================================================
AEGIS DEMO MODE — MANDATORY
============================================================

Build a complete DEMO MODE into the AEGIS application.

Demo Mode is NOT a static mockup.

It must be an interactive simulation of the real AEGIS workflow and use the same UI, event system, state machine, notification system, map, severity engine, and admin dashboard as Live Mode wherever possible.

The purpose is to allow the competition team to demonstrate the complete AEGIS concept reliably even when:
- no external CCTV camera is available
- no thermal camera is connected
- no multiple physical devices are available
- internet connectivity is unreliable
- real emergency conditions cannot be reproduced safely

============================================================
MODE SWITCHER
============================================================

Add a prominent but elegant mode selector:

LIVE MODE
DEMO MODE

LIVE MODE:
Uses actual connected hardware and browser capabilities.

DEMO MODE:
Uses controlled simulated inputs but follows the same AEGIS operational workflow.

Clearly show the active mode throughout the application.

Example:

● LIVE
or
◆ DEMO

Do not make Demo Mode look like a fake or broken version of the product.

============================================================
DEMO CONTROL CENTER
============================================================

Add a “Demo Controls” panel available to authorized admin/demo users.

Controls:

START DEMO
PAUSE DEMO
RESET DEMO

SCENARIOS:

1. HUMAN FALL
2. REMOTE FALL
3. FIRE + THERMAL
4. ANIMAL DISTRESS
5. POPULATED CAMPUS INCIDENT
6. MULTI-CAMERA INCIDENT

Each scenario must trigger actual application state changes.

Do NOT simply change labels on the screen.

============================================================
DEMO SCENARIO 1 — HUMAN FALL
============================================================

When selected:

Show a camera feed / controlled demo video.

Sequence:

NORMAL
↓
PERSON DETECTED
↓
POSE ANALYSIS
↓
SUDDEN DOWNWARD MOVEMENT
↓
POSSIBLE FALL
↓
VERIFYING

Start a visible timer:

00:01
00:03
00:05
...
00:10

Then:

EMERGENCY CONFIRMED

Create a real EmergencyEvent in the application.

Show:

Type:
PERSON FALL

Severity:
HIGH

Camera:
AEGIS-CAM-DEMO-01

Location:
Demo Location

Then trigger the normal responder-notification workflow.

============================================================
DEMO SCENARIO 2 — REMOTE FALL
============================================================

This should be the main competition demonstration.

Scenario:

Camera:
AEGIS-CAM-REMOTE-01

Environment:
Remote Service Road

Person:
Falls

No nearby human activity.

AEGIS:

DETECT
↓
VERIFY
↓
ASSESS
↓
LOCATE
↓
ALERT
↓
RESPOND

The map should show:

Emergency location
Nearby registered responder
Responder route

Then trigger:

AEGIS EMERGENCY

PERSON FALL
HIGH PRIORITY

NEAREST RESPONDER

[ACCEPT RESPONSE]

When accepted:

RESPONDER ACCEPTED

Then:

EN ROUTE

Admin dashboard must update in realtime.

============================================================
DEMO SCENARIO 3 — FIRE + THERMAL
============================================================

Show a fire scenario using a controlled demo feed.

RGB view:

VISIBLE FIRE
SMOKE

Thermal view:

SIMULATED THERMAL VISUALIZATION

Clearly display:

DEMO THERMAL MODE

Show:

RGB FIRE SIGNAL
+
SMOKE SIGNAL
+
THERMAL HOTSPOT

↓

AEGIS FUSION

↓

CRITICAL

Create a real emergency event.

Example:

FIRE DETECTED
SEVERITY: CRITICAL

Do not describe the thermal visualization as a real thermal measurement.

============================================================
DEMO SCENARIO 4 — ANIMAL DISTRESS
============================================================

Show an animal in a controlled demo feed.

Sequence:

ANIMAL DETECTED
↓
POSTURE ANALYSIS
↓
LOW MOVEMENT
↓
PERSISTENT IMMOBILITY
↓
THERMAL CONTEXT
↓
POSSIBLE ANIMAL DISTRESS

Create:

ANIMAL EMERGENCY

Location:
Demo Animal Area

Responder:
Animal Rescue

Send a realtime responder notification.

Do not claim medical diagnosis.

============================================================
DEMO SCENARIO 5 — POPULATED CAMPUS
============================================================

Show a busy campus scene.

Multiple people.
Animals.
Vehicles.
Normal activities.

Multiple camera feeds should appear.

AEGIS continuously monitors the environment.

One person falls.

The system should identify the abnormal event among normal activity.

Show:

MULTI-OBJECT DETECTION

PERSON
ANIMAL
VEHICLE
NORMAL ACTIVITY

↓

ABNORMAL EVENT

↓

EMERGENCY

============================================================
DEMO SCENARIO 6 — MULTI-CAMERA INCIDENT
============================================================

Show a simulated environment containing:

CAM 01
CAM 02
CAM 03
CAM 04
CAM 05

Each has a realistic status:

STREAMING
IDLE
OFFLINE
ANALYZING

Trigger an event on CAM 04.

Only CAM 04 should transition to:

EMERGENCY

The Admin Dashboard must immediately update.

============================================================
DEMO DEVICE NETWORK
============================================================

Allow the application to simulate multiple AEGIS devices.

Example:

AEGIS-CAM-001
Main Entrance
ONLINE

AEGIS-CAM-002
Parking Area
ONLINE

AEGIS-CAM-003
Corridor
STREAMING

AEGIS-CAM-004
Remote Service Road
EMERGENCY

AEGIS-CAM-005
Sports Area
OFFLINE

These must be generated from actual application data/state, not hard-coded visual elements.

============================================================
DEMO RESPONDERS
============================================================

Create demo responders with realistic metadata.

Example:

Responder:
Campus Security 01

Type:
Security

Distance:
180 m

Status:
AVAILABLE

Another:

Responder:
Animal Rescue 01

Type:
Animal Rescue

Distance:
450 m

Status:
AVAILABLE

When an event occurs:

AEGIS calculates/selects an appropriate demo responder based on:

location
availability
responder category

Then sends the event.

============================================================
REALTIME DEMO ALERT
============================================================

When Demo Mode triggers an emergency:

Other connected AEGIS browser sessions should receive the alert.

Example:

BROWSER 1:
Admin Dashboard

BROWSER 2:
Responder Dashboard

BROWSER 3:
Monitoring Screen

The same simulated emergency should propagate through the realtime system.

This should allow the competition team to demonstrate:

Laptop → emergency
↓
server/realtime event
↓
admin dashboard
↓
responder phone/laptop
↓
accept response
↓
admin updates

============================================================
DEMO MAP
============================================================

Create a predefined demo map environment.

Show:

Camera locations
Emergency location
Responder locations
Routes

Do not rely on live GPS for Demo Mode.

Demo Mode should use predefined coordinates.

Live Mode should use actual browser location when permission is available.

Clearly distinguish:

DEMO LOCATION

from

LIVE LOCATION

============================================================
DEMO THERMAL MODE
============================================================

The thermal panel should have:

THERMAL CAMERA:
UNAVAILABLE

when no hardware exists.

Then Demo Mode can activate:

THERMAL:
DEMO

SIMULATED THERMAL VISUALIZATION

Show controlled thermal heat patterns for:

Human
Animal
Fire hotspot

Never label simulated thermal data as actual measured temperature.

============================================================
DEMO CAMERA FEEDS
============================================================

Provide reliable demo media.

Possible sources:

- bundled local demo clips
- generated procedural scene visualization
- safe sample video

The demo feed must NOT randomly change.

It must have deterministic timing so the team knows exactly what will happen.

Example:

At 3 seconds:
person begins falling

At 5 seconds:
fall detected

At 10 seconds:
verification complete

At 12 seconds:
emergency confirmed

This makes the competition demonstration repeatable.

============================================================
DEMO TIMELINE
============================================================

Display a visible system timeline:

00:00
MONITORING

00:03
PERSON DETECTED

00:05
FALL DETECTED

00:05–00:15
VERIFYING

00:15
EMERGENCY CONFIRMED

00:16
SEVERITY ASSESSED

00:17
LOCATION IDENTIFIED

00:18
RESPONDER ALERTED

00:20
RESPONDER ACCEPTED

00:21
RESPONDER EN ROUTE

This timeline should update from the actual demo state machine.

============================================================
DEMO PRESENTATION MODE
============================================================

Add a special:

PRESENTATION MODE

This creates a clean full-screen competition interface.

Hide:
- development controls
- settings
- unnecessary navigation

Show only:

LIVE CAMERA
AI ANALYSIS
EMERGENCY STATE
THERMAL PANEL
MAP
RESPONDER STATUS

Use large readable elements.

============================================================
DEMO SAFETY
============================================================

The system must never encourage someone to actually fall, get injured, start a fire, or create a dangerous animal situation.

The demonstration uses simulated/controlled scenarios.

Provide:

“SIMULATED DEMO EVENT”

where appropriate.

============================================================
RESET
============================================================

The entire demo should be resettable.

RESET DEMO must:

- clear active emergency
- reset camera states
- reset responders
- clear notifications
- reset maps
- reset timers
- reset severity
- reset AI overlays
- return to monitoring state

The team should be able to restart the entire demonstration in seconds.

============================================================
DEMO MODE SUCCESS CRITERIA
============================================================

A successful competition demonstration should allow the presenter to do:

1. Open AEGIS.
2. Select DEMO MODE.
3. Select REMOTE FALL.
4. Start scenario.
5. Show camera monitoring.
6. Show AI detecting a person.
7. Show movement/pose analysis.
8. Show fall detection.
9. Show verification timer.
10. Show emergency confirmation.
11. Show thermal context.
12. Show severity.
13. Show location on map.
14. Show nearest responder.
15. Send automatic alert.
16. Receive alert on another connected AEGIS device/browser.
17. Accept response.
18. Show responder route.
19. Show admin dashboard updating.
20. Reset and repeat.

The complete demonstration should take approximately 30–60 seconds.

============================================================
VISUAL REQUIREMENT
============================================================

Demo Mode must use the SAME AEGIS UI as Live Mode.

Do not create a completely different demo interface.

Only add a subtle DEMO indicator.

The audience should feel that:

“THIS IS THE SAME AEGIS SYSTEM — WE ARE JUST USING CONTROLLED INPUTS FOR THE DEMONSTRATION.”

============================================================
FINAL PRINCIPLE
============================================================

LIVE MODE proves:
AEGIS can work with real browser hardware.

DEMO MODE proves:
AEGIS can demonstrate the complete end-to-end emergency workflow reliably.

Both modes must share the same:
- event model
- state machine
- notification system
- responder logic
- map logic
- admin dashboard
- severity engine
- UI components