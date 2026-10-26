import { useState } from 'react';
import { DEFAULT_SETTINGS } from './data/settings';
import type { Settings } from './data/settings';
import { AudioEngine } from './audio/AudioEngine';
import { TitleScreen } from './screens/TitleScreen';
import { SinglePlayerMenu } from './screens/SinglePlayerMenu';
import { MahjongPhonicsGame } from './screens/MahjongPhonicsGame';
import { TimedMode } from './screens/TimedMode';
import { ClassicMode } from './screens/ClassicMode';
import { PhonicsJourneyGame } from './screens/PhonicsJourneyGame';
import { PinyinGame } from './screens/PinyinGame';

type Screen = "title" | "singleplayer" | "endless" | "timed" | "classic" | "journey" | "pinyin";

// --- ROOT APP - manages screen routing ----------------------------------------
export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const updateSetting = <K extends keyof Settings>(key: K, val: Settings[K]) =>
    setSettings(s => ({ ...s, [key]: val }));

  const handleUnlock = () => AudioEngine.unlock();

  let content;
  if (screen === "pinyin") {
    content = <PinyinGame onBack={() => setScreen("title")} />;
  } else if (screen === "journey") {
    content = <PhonicsJourneyGame onBack={() => setScreen("singleplayer")} />;
  } else if (screen === "endless") {
    content = <MahjongPhonicsGame onBackToTitle={() => setScreen("title")} settings={settings} />;
  } else if (screen === "timed") {
    content = <TimedMode onBackToTitle={() => setScreen("title")} settings={settings} />;
  } else if (screen === "classic") {
    content = <ClassicMode onBackToTitle={() => setScreen("title")} settings={settings} />;
  } else if (screen === "singleplayer") {
    content = <SinglePlayerMenu
      onJourney={() => setScreen("journey")}
      onEndless={() => setScreen("endless")}
      onTimed={() => setScreen("timed")}
      onClassic={() => setScreen("classic")}
      onBack={() => setScreen("title")}
    />;
  } else {
    content = <TitleScreen
      onJourney={() => setScreen("journey")}
      onEndless={() => setScreen("endless")}
      onTimed={() => setScreen("timed")}
      onClassic={() => setScreen("classic")}
      onPinyin={() => setScreen("pinyin")}
      settings={settings}
      updateSetting={updateSetting}
    />;
  }

  return (
    <div onClick={handleUnlock} onTouchStart={handleUnlock} onKeyDown={handleUnlock} style={{ outline: "none" }}>
      {content}
    </div>
  );
}
