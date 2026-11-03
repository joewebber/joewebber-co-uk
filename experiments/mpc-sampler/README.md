# MPC Sampler

An Akai MPC-style sampler for your phone. Expo / React Native, 16 pads × 4 banks.

## Run it on your phone

Easiest route is **Expo Go** (no build needed; everything used here works in it):

```bash
cd experiments/mpc-sampler
npm install
npx expo start
```

Install **Expo Go** from the App Store / Play Store and scan the QR code
(Camera app on iOS, Expo Go's scanner on Android). Phone and computer must be on
the same network; add `--tunnel` if they aren't.

### Installing a real build instead

```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview   # installable .apk
eas build -p ios --profile preview       # needs an Apple developer account
```

## How it works

Pad 1 is bottom-left, as on an MPC. Bottom buttons pick what tapping a pad does:

| Mode  | Tap a pad to…                                              |
|-------|------------------------------------------------------------|
| PLAY  | trigger its sample (retriggers from the top)               |
| REC   | start recording from the mic; tap the pad again to stop    |
| LOAD  | pick an audio file from the phone onto the pad             |
| ERASE | clear the pad                                              |

The last pad you touched is *selected*. The LCD shows its name, and the buttons
below adjust its volume, pitch (±12 semitones, tape-style so speed changes too)
and play mode: ONE-SHOT, LOOP or GATE (plays only while held).

Samples and pad settings are saved on the device and restored on launch.

## Not built yet

Sequencer / step recording, sample trimming, chop, choke groups, velocity
(touch pressure), master effects, project export. Audio latency is whatever
`expo-audio` gives; if it matters, the next step is a native audio module.
