Build a FULLY WORKING web application for:

AEGIS
AI-Powered Emergency Guardian & Intelligent Safety System

TAGLINE:
Detect. Verify. Assess. Locate. Alert. Respond.

This is a real functional prototype for a student innovation competition.

DO NOT build only a landing page.

DO NOT create fake dashboard interactions.

The website must actually work with:
- laptop webcam
- mobile phone camera where browser permissions/platform allow it
- live video analysis
- live AI overlays
- coordinates/location
- emergency detection states
- device registration
- multi-device monitoring
- admin dashboard
- live camera viewing
- responder alerts
- nearby-device notification simulation
- event history
- system status

The application should be designed as a platform that can later support real deployed cameras, but the CURRENT prototype must work without any external CCTV hardware.

============================================================
PROJECT CONTEXT
============================================================

AEGIS continuously analyzes authorized camera feeds and detects predefined emergency indicators.

The original core capabilities are:

- camera monitoring
- person detection
- fall detection
- motionless verification
- fire detection
- location identification
- emergency alerts
- responder coordination
- central dashboard

The expanded concept includes:

- distributed camera monitoring
- thermal imaging support
- human thermal signature context
- animal monitoring
- environmental/fire monitoring
- multi-sensor severity assessment
- nearby responder/device alerting
- remote-area emergency detection
- future authorized public-alert integration

AEGIS is NOT limited to crowded public places.

It should work conceptually across:

- college campuses
- corridors
- classrooms
- entrances
- parking areas
- roads
- remote campus areas
- rural locations
- isolated areas
- warehouses
- industrial environments
- animal-care areas
- other authorized monitored locations

The strongest use case is when an emergency happens and nobody is nearby to notice.

============================================================
TECH STACK
============================================================

Preferred stack:

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS

UI:
- use the project's existing component system or a small accessible component layer
- do not introduce unnecessary dependencies

AI / Vision:
- browser-compatible computer vision where practical
- MediaPipe or another suitable browser-compatible pose/object solution
- OpenCV.js where useful
- Web Workers where appropriate for expensive frame processing

Backend:
- Next.js API routes OR a small FastAPI backend
- choose the architecture that gives the best reliable local prototype

Realtime:
- WebSocket / Socket.IO where appropriate
- WebRTC for future multi-camera streaming
- WebSocket is sufficient for event/status updates
- use Supabase/Firebase only if genuinely useful; do not add cloud complexity without need

Maps:
- use a reliable browser map solution
- abstract the map provider so it can later be switched

Storage:
- local development storage/mock persistence first
- structure data models so Supabase/Firebase/PostgreSQL can be added cleanly

============================================================
MANDATORY ECC
============================================================

Before implementation, use ECC Universal methodology.

If ECC is not already configured in the project/environment, inspect the installed environment and use:

npx ecc-universal setup

Do NOT blindly reinstall ECC if it is already configured.

Follow the current ECC methodology for:
- architecture
- planning
- implementation
- testing
- security
- code review
- validation
- maintainability

Use the appropriate ECC skills/agents/rules for:
- architecture review
- frontend implementation
- security
- testing
- code review
- debugging

Do not cargo-cult every ECC artifact.
Use only what is relevant to this project.

At the end:
- perform code review
- run tests
- run lint/type checks
- verify core flows
- perform a final security review

============================================================
DESIGN METHODOLOGY
============================================================

Use these references:

1. Taste Skill:
https://github.com/Leonxlnx/taste-skill

2. UI UX Pro Max:
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

3. Optional Liquid Glass reference:
https://github.com/dashersw/liquid-glass-js

4. Optional Shader Gradient reference:
https://github.com/ruucm/shadergradient

Do NOT copy the visual appearance of these repositories.

Use their principles to create an original AEGIS design system.

Taste Skill should drive:
- layout quality
- hierarchy
- spacing
- composition
- motion
- anti-generic visual decisions

UI UX Pro Max should drive:
- coherent design system
- UX decisions
- responsive behavior
- accessibility
- component consistency
- pre-delivery checks

Liquid glass may be used selectively for:
- overlays
- floating camera controls
- emergency notification surfaces
- compact command-center panels

Do NOT turn the entire site into glassmorphism.

Shader gradients may be used only subtly in:
- hero background
- active emergency state
- ambient visualization

Do not overuse them.

============================================================
OVERALL VISUAL DIRECTION
============================================================

The website should feel like:

A REAL EMERGENCY OPERATIONS PRODUCT

not:
- a generic AI SaaS
- a gaming interface
- a cyberpunk dashboard
- a college project template
- a fake futuristic control room

Design characteristics:

- premium
- clean
- cinematic
- technical
- calm
- high trust
- operational
- modern
- excellent information hierarchy

Primary palette:
- deep navy
- near-black
- white
- cool gray

Accent:
- cyan / electric blue for normal system activity
- amber for warning
- emergency red for critical states
- green only for confirmed/recovered/safe states

Use semantic colors consistently.

============================================================
RESPONSIVE DESIGN
============================================================

Desktop:
optimized for laptop/desktop command center

Tablet:
usable

Mobile:
fully responsive

Mobile should feel like the same product, not a reduced desktop layout.

On mobile:
- camera view remains prominent
- emergency status remains visible
- location is accessible
- responder alerts are actionable
- admin functions adapt into stacked layouts

Do NOT simply shrink desktop UI.

============================================================
PUBLIC LANDING / OVERVIEW
============================================================

Create a polished public-facing home page.

Hero:

AEGIS

AI-Powered Emergency Guardian & Intelligent Safety System

“Detect. Verify. Assess. Locate. Alert. Respond.”

Hero visual:
live-style camera scene visualization

Show subtle AI overlays:
person
animal
vehicle
normal activity

Do not make it look like fake AI magic.

Sections:

1. The problem
2. How AEGIS works
3. Continuous environment monitoring
4. Human + animal + environmental emergencies
5. Thermal intelligence
6. Remote-area value
7. Responder network
8. Live prototype preview
9. Future public-alert integration
10. CTA to launch monitoring console

============================================================
MAIN PRODUCT AREA
============================================================

Create an authenticated-style application area with navigation:

Overview
Live Monitor
Devices
Emergencies
Map
Responders
Analytics
Admin
Settings

Keep the navigation compact and professional.

============================================================
LIVE MONITOR — CORE FEATURE
============================================================

THIS IS THE MOST IMPORTANT PAGE.

The user must be able to:

1. Request camera permission
2. Turn laptop webcam on
3. View the live camera feed
4. Turn analysis on/off
5. See detection overlays
6. See event state
7. See coordinates/location
8. See analysis metrics
9. Trigger emergency state through real detection or a clearly labelled simulation control
10. Stop camera

Camera panel:

LIVE CAMERA

Top status:
CONNECTED
ANALYZING

Display:
FPS
resolution
camera ID
timestamp

AI overlays should be rendered over the live video.

============================================================
AI MOVEMENT VISUALIZATION
============================================================

Show how AI analyzes human movement.

When a person is detected:

- bounding box
- pose landmarks
- body skeleton
- motion vector
- movement trajectory

Visually demonstrate:

STANDING
→
DOWNWARD MOVEMENT
→
FALL
→
MOTIONLESS

Show a subtle side panel:

AI MOVEMENT ANALYSIS

Pose confidence
Movement velocity
Fall confidence
Recovery state
Motionless duration

Example:

PERSON DETECTED
Confidence: 96%

Fall confidence: 89%

Motionless: 7 sec

Do not invent medically meaningful metrics.

Clearly label metrics as computer-vision measurements.

============================================================
FALL VERIFICATION
============================================================

Implement a state machine.

Example states:

NORMAL

POSSIBLE FALL

VERIFYING

EMERGENCY CONFIRMED

RECOVERED

The system should not jump from normal to emergency instantly.

Use a configurable verification period.

For the prototype:
default:
10 seconds

Show the countdown.

If person recovers:
mark as RECOVERED.

If person remains motionless:
escalate to EMERGENCY CONFIRMED.

============================================================
THERMAL PANEL
============================================================

Create a thermal visualization panel.

IMPORTANT TECHNICAL RULE:

A normal laptop/phone RGB camera does NOT provide true thermal information.

Do NOT fake a thermal sensor and claim it is real.

Instead support THREE states:

1. THERMAL CAMERA CONNECTED
2. THERMAL SENSOR UNAVAILABLE
3. DEMO THERMAL MODE

In Demo Thermal Mode:
clearly display:

SIMULATED THERMAL VISUALIZATION

This can use a heat-map-like rendering derived from demo data or sample footage.

If a real thermal camera is available later:
the architecture should allow a real thermal stream to replace the demo source.

Thermal view should show conceptual support for:

HUMAN
thermal signature

ANIMAL
thermal signature

FIRE
hotspot

ENVIRONMENT
thermal anomaly

The UI should explicitly explain:

“Thermal imaging provides additional environmental and apparent surface-temperature context. It is not a medical diagnostic system.”

============================================================
CAMERA + THERMAL FUSION
============================================================

Create a live visualization:

RGB CAMERA
+
THERMAL CAMERA
+
MOTION
+
DURATION
+
LOCATION

↓

AEGIS AI FUSION

↓

EVENT
+
SEVERITY

In the current laptop-camera prototype:
RGB should be REAL.
Thermal should display unavailable or DEMO mode unless a compatible thermal source exists.

============================================================
OBJECT / SCENE DETECTION
============================================================

The camera should conceptually support MULTI-OBJECT DETECTION.

Possible visible classes:

Person
Animal
Vehicle
Fire
Smoke

Important:
Not every detected object is an emergency.

Show:

PERSON — MONITORED
DOG — MONITORED
VEHICLE — MONITORED
SMOKE — INVESTIGATING

Then abnormal situations can escalate.

Use labels like:

MONITORED
NORMAL
INVESTIGATING
WARNING
EMERGENCY

============================================================
ANIMAL MONITORING
============================================================

Create support for animal detection.

Possible flow:

ANIMAL DETECTED

↓

POSTURE MONITORING

↓

MOTION MONITORING

↓

PERSISTENT IMMOBILITY

↓

THERMAL CONTEXT
(if available)

↓

POSSIBLE ANIMAL DISTRESS

Example dashboard:

ANIMAL DETECTED

Species:
Dog

Status:
Possible Distress

Duration:
18 min

Location:
Campus Parking Area

Responder:
Animal Rescue

Do NOT claim medical diagnosis.

============================================================
FIRE DETECTION
============================================================

Use the camera feed to detect:
- visible flames
- smoke
- other configured fire indicators

If thermal is available:
combine thermal hotspot data.

Show:

RGB FIRE ANALYSIS
+
THERMAL HOTSPOT

↓

FIRE CONFIDENCE

↓

SEVERITY

============================================================
SEVERITY ENGINE
============================================================

Build a visual severity engine.

Inputs:

Vision
Motion
Duration
Thermal context
Location context

Outputs:

NORMAL
LOW
MEDIUM
HIGH
CRITICAL

Example:

Fall + recovery
→ LOW / RECOVERED

Fall + persistent motionlessness
→ HIGH

Fire + smoke + thermal hotspot
→ CRITICAL

Do not present severity as medical certainty.

Make it a system classification.

============================================================
LOCATION
============================================================

When camera is active:

Request geolocation permission.

Show:
latitude
longitude
accuracy
timestamp

Provide a map.

Example:

AEGIS CAM 04
Remote Service Road

Lat:
[actual browser location]

Lon:
[actual browser location]

Accuracy:
[actual browser result]

If browser geolocation is unavailable:
clearly show:

LOCATION UNAVAILABLE

and provide manual location selection for demo.

Do not invent coordinates.

============================================================
DEVICE MANAGEMENT
============================================================

Create a Devices page.

Show all registered AEGIS devices.

Columns/cards:

Device ID
Name
Type
Location
Status
Stream Status
Last Seen
Current Event

Example:

AEGIS-CAM-001
Main Entrance
CONNECTED
STREAMING

AEGIS-CAM-002
Parking Area
CONNECTED
OFFLINE

AEGIS-CAM-003
Remote Road
CONNECTED
STREAMING

Use realistic status indicators.

============================================================
MULTI-DEVICE STREAMING
============================================================

The architecture must support multiple camera/device streams.

For the current prototype:

- the current browser can register itself as one streaming device
- other browser tabs/devices can register as separate demo devices
- live availability/status should synchronize through the realtime layer

For a real multi-device demo:
allow separate phones/laptops on the same network to open a device registration URL/session.

Use an actual realtime mechanism for:
- device presence
- emergency events
- responder acceptance
- stream status

Do NOT fake realtime data with random numbers.

============================================================
ADMIN DASHBOARD
============================================================

Create a serious administrator control center.

Admin should see:

TOTAL DEVICES
ONLINE
STREAMING
OFFLINE
ACTIVE EMERGENCIES
RESPONDERS AVAILABLE

Example KPI strip:

12 DEVICES
8 STREAMING
3 ONLINE IDLE
1 OFFLINE
2 ACTIVE INCIDENTS

Use real data from the application state/database.

============================================================
ADMIN LIVE CAMERA ACCESS
============================================================

The admin must be able to open a device and watch its live stream.

Device detail:

AEGIS-CAM-001

Location:
Main Entrance

Status:
Streaming

Buttons:

WATCH LIVE
PAUSE
FULLSCREEN
OPEN MAP
VIEW EVENTS

The architecture should use a proper media/realtime approach.

For browser-only demo:
WebRTC or a realtime video stream mechanism should be used where practical.

Do not create a fake moving video background and call it live.

If multi-device WebRTC is too complex for the initial implementation:
implement a clearly functional local/demo mode first, but structure the media layer so WebRTC can be added without rewriting the application.

============================================================
DEVICE REGISTRATION
============================================================

Allow a new browser/device to become an AEGIS camera endpoint.

Flow:

REGISTER DEVICE

Device name
Device type
Location
Camera permissions

↓

REGISTER

↓

DEVICE ID CREATED

↓

STREAMING

Show QR/link pairing for future convenience.

============================================================
EMERGENCY EVENTS
============================================================

Create an Emergencies page.

Show:

Active
Resolved
Acknowledged

Each event:

Event ID
Type
Severity
Source
Location
Time
Status
Assigned responder

Example:

AEGIS-EVT-0041

PERSON FALL

HIGH

Source:
AEGIS-CAM-004

Location:
Remote Service Road

Status:
RESPONDER EN ROUTE

============================================================
AUTOMATIC EMERGENCY ALERTING
============================================================

THIS IS A CORE REQUIREMENT.

When an emergency is confirmed:

AEGIS must automatically create an emergency event.

Then determine nearby registered AEGIS devices/responders based on:
- location
- availability
- responder type
- emergency category

Send a realtime alert.

Example:

🚨 AEGIS EMERGENCY

PERSON FALL DETECTED

HIGH PRIORITY

Distance:
180 m

Location:
Remote Service Road

Buttons:

VIEW LOCATION
ACCEPT RESPONSE

Do not require the admin to manually send the alert.

The event itself triggers the notification.

============================================================
NEARBY DEVICE ALERT
============================================================

“Nearby devices” means devices/users that are registered in the AEGIS system.

Do NOT attempt to send arbitrary notifications to every nearby phone.

For the current prototype:

Use browser/app notifications and realtime events for registered AEGIS clients.

If browser notification permission is unavailable:
show an in-app urgent notification.

The alert should reach other connected AEGIS clients.

============================================================
RESPONDER WORKFLOW
============================================================

Responder receives:

EMERGENCY ALERT

↓

VIEW DETAILS

↓

ACCEPT RESPONSE

↓

RESPONDER EN ROUTE

↓

ARRIVED

↓

RESOLVED

Update event status in realtime.

Admin should see the change immediately.

============================================================
MAP
============================================================

Create an interactive map page.

Show:

all active cameras/devices
their locations
active emergencies
responders

Use semantic markers:

camera
emergency
responder
animal emergency
fire

Clicking a marker opens details.

Map should support:
- zoom
- pan
- recenter
- marker details

============================================================
REMOTE-AREA SCENARIO
============================================================

Create a dedicated demo mode:

REMOTE AREA INCIDENT

Example:

Camera:
AEGIS-CAM-004

Location:
Remote Service Road

Person falls.

AI detects.

Verification begins.

10-second timer.

No recovery.

Emergency confirmed.

Map location shown.

Nearest registered responder calculated.

Responder alerted.

Responder accepts.

Admin sees:

RESPONDER EN ROUTE

This should be the strongest end-to-end demonstration.

============================================================
POPULATED ENVIRONMENT
============================================================

Also demonstrate:

busy campus
multiple people
multiple cameras
normal activities

AEGIS monitors continuously.

A fall occurs.

The system identifies the event despite other normal activity.

This proves AEGIS is environment-wide rather than a single-event detector.

============================================================
EVENT TIMELINE
============================================================

For every emergency create a timeline:

DETECTED
VERIFIED
ASSESSED
LOCATED
ALERTED
RESPONDER ACCEPTED
EN ROUTE
RESOLVED

Show timestamps.

============================================================
ANALYTICS
============================================================

Create a lightweight analytics page.

Show:
- incidents today
- incidents by category
- response status
- active devices
- camera uptime
- emergency distribution by location
- human vs animal vs fire incidents

Do not invent historical statistics.

Only show:
- actual events
- demo events
- clearly labelled sample/demo data

============================================================
SETTINGS
============================================================

Create configuration for:

Fall verification seconds
Motionless threshold
Emergency severity thresholds
Notification preferences
Demo thermal mode
Camera settings
Privacy / retention settings

============================================================
SECURITY + PRIVACY
============================================================

This is an emergency monitoring platform.

Include:

Authentication
Authorization
Admin role
Responder role
Viewer role

Do not expose all camera streams to every user.

Admin:
can view registered streams

Responder:
can view assigned incident information

Viewer:
limited access

Do not expose raw camera streams publicly.

Use clear consent for camera access.

Show privacy notice before camera activation.

Never claim:
“secure by default” without actually implementing appropriate protections.

Do basic:
- input validation
- permission checks
- rate limiting where appropriate
- secure session handling
- safe realtime message validation
- no hard-coded secrets
- no secrets in frontend
- environment variables
- access control

============================================================
PRIVACY UX
============================================================

Show a small transparent notice:

“AEGIS analyzes authorized camera feeds for predefined emergency indicators. Camera and location access requires user permission.”

Make it easy for the user to stop monitoring.

============================================================
DEMO MODE
============================================================

Build a DEMO MODE for competition presentation.

This is extremely important.

The judges should be able to experience the entire workflow even without external hardware.

Demo controls:

START DEMO
TRIGGER FALL
TRIGGER FIRE
TRIGGER ANIMAL DISTRESS
TRIGGER REMOTE INCIDENT
RESET

But clearly label simulated events as:

DEMO EVENT

Do not present simulated results as real-world AI accuracy.

============================================================
LIVE CAMERA DEMO
============================================================

The competition presenter should be able to:

1. Open website
2. Click Start Camera
3. Allow webcam
4. Show live camera feed
5. Stand in front of camera
6. Move
7. Simulate a fall safely
8. Show pose detection
9. Show movement analysis
10. Show verification timer
11. Trigger confirmed emergency
12. Show location
13. Send alert to another registered device/browser
14. Open admin
15. Watch event appear
16. Accept responder alert
17. Show route/status

This flow must work reliably.

============================================================
THERMAL DEMO
============================================================

Since an ordinary webcam has no thermal sensor:

The demo must offer:

THERMAL:
Unavailable

or:

THERMAL:
Demo Mode

When Demo Mode is active:

SIMULATED THERMAL VISUALIZATION

Make this visually impressive but unmistakably simulated.

The future architecture should allow a real thermal feed later.

============================================================
DATA MODEL
============================================================

Create clean types/models for:

User
Device
Camera
Stream
Detection
EmergencyEvent
Responder
Location
Notification
IncidentTimeline
ThermalSource

Use strong TypeScript typing.

============================================================
API / REALTIME MODEL
============================================================

Define clear APIs/events for:

registerDevice
deviceHeartbeat
deviceStreamStarted
deviceStreamStopped
cameraStatusUpdated
detectionCreated
emergencyCreated
emergencyUpdated
responderMatched
notificationCreated
responderAccepted
incidentResolved

Keep the architecture modular.

============================================================
COMPONENT STRUCTURE
============================================================

Create reusable components such as:

CameraViewer
CameraGrid
AIOverlay
PoseVisualizer
ThermalViewer
SeverityMeter
EmergencyBanner
EmergencyCard
DeviceCard
DeviceTable
LocationMap
ResponderCard
EventTimeline
NotificationPanel
SystemHealth
AdminCameraViewer

Do not duplicate these components.

============================================================
UI MOTION
============================================================

Use tasteful motion.

Examples:

AI bounding box transitions
pose landmark animation
severity meter progression
live status pulse
emergency banner transition
map marker movement
notification entry
camera status change

Do not make the interface constantly moving.

Motion should communicate system state.

============================================================
ACCESSIBILITY
============================================================

Support:

keyboard navigation
visible focus
sufficient contrast
ARIA where appropriate
reduced-motion preference
clear error states

============================================================
PERFORMANCE
============================================================

Do not process every video frame in the main React render loop.

Use:
- requestAnimationFrame carefully
- Web Workers where beneficial
- throttled inference
- canvas/video separation
- memoized UI
- efficient state updates

Keep the camera preview smooth.

============================================================
ERROR STATES
============================================================

Every major interaction needs a real error state.

Examples:

Camera permission denied
Camera unavailable
Location permission denied
AI model failed
Thermal unavailable
Device offline
Realtime disconnected
Notification permission denied

Explain what the user can do next.

Do not show blank screens.

============================================================
LANDING PAGE VISUAL STORY
============================================================

The public homepage should visually communicate:

CAMERAS EVERYWHERE
↓

AEGIS AI MONITORING

↓

PEOPLE
ANIMALS
FIRE
ENVIRONMENT

↓

VERIFY

↓

SEVERITY

↓

LOCATION

↓

RESPONDER

↓

RESPONSE

Use large cinematic visuals and minimal text.

============================================================
DESIGN QUALITY RULES
============================================================

DO NOT:

- use generic dashboard templates
- make every section a card grid
- use excessive rounded rectangles
- use excessive gradients
- use cyberpunk neon
- use fake 3D blobs everywhere
- use random stock imagery
- use meaningless animation
- make all text uppercase
- overfill the screen

DO:

- establish a strong design system first
- use large editorial headlines
- use clear hierarchy
- use generous spacing
- create strong visual focal points
- use asymmetric composition where useful
- use restrained glass surfaces
- use meaningful motion
- create a real operations-console feel

============================================================
PAGE HIERARCHY
============================================================

Landing page:
storytelling

Live Monitor:
video-first

Admin:
information-first

Emergency:
incident-first

Devices:
infrastructure-first

Map:
spatial-first

Responders:
action-first

Analytics:
summary-first

============================================================
IMPORTANT PRODUCT PRINCIPLE
============================================================

AEGIS IS NOT JUST “A CCTV WEBSITE.”

It is:

A CONTINUOUS AI-POWERED ENVIRONMENT MONITORING AND EMERGENCY RESPONSE PLATFORM.

The cameras are distributed throughout an environment.

Each camera can observe multiple classes of objects and configured emergency indicators.

AEGIS can monitor:

PEOPLE
ANIMALS
VEHICLES
FIRE
SMOKE
THERMAL ANOMALIES
ABNORMAL MOVEMENT
PERSISTENT IMMOBILITY
OTHER PREDEFINED HAZARDS

The system should clearly communicate:

“ONE PLATFORM.
MULTIPLE CAMERAS.
MULTIPLE SENSORS.
MULTIPLE EMERGENCIES.”

============================================================
CURRENT VS FUTURE
============================================================

CURRENT WORKING PROTOTYPE:

✓ Laptop webcam
✓ Browser camera access
✓ AI vision / pose analysis
✓ Fall detection workflow
✓ Motionless verification
✓ Location
✓ Emergency events
✓ Admin dashboard
✓ Device registration
✓ Realtime status
✓ Registered responder alerts
✓ Demo thermal mode
✓ Animal-event demo
✓ Fire-event demo

FUTURE:

→ Real CCTV/IP camera deployment
→ Real thermal cameras
→ Large-scale WebRTC infrastructure
→ Production cloud backend
→ Official emergency-service integrations
→ Government/public-warning integration
→ Large geographic deployments

Make this distinction clear in the UI and documentation.

============================================================
GOVERNMENT / PUBLIC ALERT INTEGRATION
============================================================

Create a future architecture section:

AEGIS
↓
VERIFIED EMERGENCY EVENT
↓
AUTHORIZED AUTHORITY
↓
PUBLIC WARNING INFRASTRUCTURE
↓
GEO-TARGETED PUBLIC ALERT

Label:

FUTURE / AUTHORIZED INTEGRATION

Do not claim direct access to government emergency broadcast infrastructure.

============================================================
DELIVERABLE
============================================================

Create a polished, fully runnable project.

Include:

- complete source code
- environment example
- setup instructions
- README
- database/schema documentation if applicable
- API documentation
- demo instructions
- test instructions

Provide a clear command to run locally.

============================================================
QUALITY GATE
============================================================

Before considering the work complete:

1. Run typecheck.
2. Run lint.
3. Run tests.
4. Test camera permission flow.
5. Test live camera rendering.
6. Test AI overlay.
7. Test fall state machine.
8. Test 10-second verification.
9. Test emergency creation.
10. Test coordinates.
11. Test device registration.
12. Test admin device list.
13. Test realtime device status.
14. Test responder notification.
15. Test responder acceptance.
16. Test event status updates.
17. Test thermal unavailable mode.
18. Test demo thermal mode.
19. Test mobile layout.
20. Test desktop layout.
21. Test role-based access.
22. Test disconnected/reconnection states.
23. Check for console errors.
24. Check for overflow.
25. Check for inaccessible controls.
26. Review the UI against Taste Skill principles.
27. Review the UI against UI UX Pro Max principles.
28. Perform ECC code/security review.

Fix issues discovered during validation before finishing.

============================================================
FINAL EXPERIENCE
============================================================

When someone opens AEGIS, they should immediately understand:

AEGIS WATCHES
→
AEGIS UNDERSTANDS
→
AEGIS VERIFIES
→
AEGIS ASSESSES
→
AEGIS LOCATES
→
AEGIS ALERTS
→
AEGIS HELPS COORDINATE RESPONSE

The website must be impressive enough for a competition demonstration while remaining technically honest and actually functional.