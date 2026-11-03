# MPC Sampler

An Akai MPC-style sampler for your phone. Expo / React Native, 16 pads × 4 banks.

## Run it on your phone

Playback uses `react-native-audio-api` (decoded buffers on a native audio graph)
for low-latency pads. That's a native module, so **Expo Go can't run it**. Use an
APK or a dev build.

**APK via GitHub Actions (no computer needed):** every push under
`experiments/mpc-sampler` on the working branch runs
`.github/workflows/mpc-sampler-apk.yml`, which attaches `mpc-sampler.apk` to a
GitHub Release. Download and install it on the phone.

**Locally:**

```bash
cd experiments/mpc-sampler
npm install
npx expo run:android          # builds and installs on a connected phone
```

Or `eas build -p android --profile preview` (iOS needs an Apple developer account).

## How it works

Pad 1 is bottom-left, as on an MPC. Bottom buttons pick what tapping a pad does:

| Mode  | Tap a pad to…                                              |
|-------|------------------------------------------------------------|
| PLAY  | trigger its sample (retriggers from the top)               |
| REC   | start recording from the mic; tap the pad again to stop    |
| LOAD  | open the sample browser for that pad                       |
| ERASE | clear the pad                                              |

Pads are multi-touch: hold as many fingers down as you like.

**Sample browser:** tap a row to audition it, then ASSIGN to load it onto the
pad. It lists a built-in drum kit (generated on first launch) plus your own
samples. ADD FILES imports audio from the phone, and anything you record is added
to the library automatically. DELETE removes a user sample (and clears any pads
using it).

The last pad you touched is *selected*. The LCD shows its name, and the buttons
below adjust its volume, pitch (±12 semitones, tape-style so speed changes too)
and play mode: ONE-SHOT, LOOP or GATE (plays only while held).

Samples and pad settings are saved on the device and restored on launch.

## Not built yet

Sequencer / step recording, sample trimming, chop, choke groups, velocity
(touch pressure), master effects, project export. Recording still uses `expo-audio`; playback is
`react-native-audio-api`. iOS audio-session handling between the two is untested.
