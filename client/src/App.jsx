// App.jsx — Ekran yönlendirici
import { useGame } from "./context/GameContext";
import LobbyScreen from "./components/LobbyScreen";
import WaitingRoom from "./components/WaitingRoom";
import GameScreen from "./components/GameScreen";
import GameOverScreen from "./components/GameOverScreen";
import SinglePlayerScreen from "./components/SinglePlayerScreen";
import EndlessScreen from "./components/EndlessScreen";
import Toast from "./components/Toast";

export default function App() {
  const { state } = useGame();
  const { phase } = state;

  function renderScreen() {
    if (phase === "lobby") return <LobbyScreen />;
    if (phase === "singleplayer") return <SinglePlayerScreen />;
    if (phase === "endless") return <EndlessScreen />;
    if (phase === "waiting") return <WaitingRoom />;
    if (
      phase === "playing" ||
      phase === "eliminated" ||
      phase === "finished_won" ||
      phase === "finished_lost"
    ) {
      if (state.gameResult) return <GameOverScreen />;
      return <GameScreen />;
    }
    if (phase === "finished") return <GameOverScreen />;
    return <LobbyScreen />;
  }

  return (
    <>
      {renderScreen()}
      <Toast />
    </>
  );
}
