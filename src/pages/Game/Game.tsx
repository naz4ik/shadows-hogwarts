import { useEffect, useRef, useState } from "react";
import { TextArea } from "../../components/TextArea/TextArea";
import { dialogueData } from "../../dialogs/dialogs";
import type { DialogueScene } from "../../types/DialogueScene";

export function Game() {
  // Стан для зберігання поточної сцени
  const [currentSceneId, setCurrentSceneId] = useState<string>("start");
  // Історія виборів гравця (для можливості повернення назад)
  const [history, setHistory] = useState<string[]>([]);
  // Важливі вибори, які можуть вплинути на кінцівку
  const [importantChoices, setImportantChoices] = useState<Set<string>>(
    new Set()
  );
  // Стан для відстеження, чи взаємодіяв користувач з грою
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Використовуємо useRef для збереження посилання на аудіо
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentMusicRef = useRef<string>("");
  const isFadingRef = useRef<boolean>(false);

  // Обробник для першої взаємодії з ігровим інтерфейсом
  useEffect(() => {
    const handleFirstClick = () => setHasInteracted(true);
    window.addEventListener("click", handleFirstClick, { once: true });
    return () => window.removeEventListener("click", handleFirstClick);
  }, []);

  // Функція для зміни музики з ефектом затухання
  const fadeAudio = (
    oldAudio: HTMLAudioElement | null,
    newMusicPath: string | null,
    onComplete: (newAudio: HTMLAudioElement | null) => void
  ) => {
    if (isFadingRef.current) return; // Перевірка, чи відбувається вже зміна музики
    isFadingRef.current = true;

    const finish = (newAudio: HTMLAudioElement | null) => {
      isFadingRef.current = false;
      onComplete(newAudio);
    };

    if (oldAudio) {
      let volume = oldAudio.volume;
      const fadeOutInterval = setInterval(() => {
        volume = Math.max(0, volume - 0.05); // Поступово зменшуємо гучність
        oldAudio.volume = volume;

        if (volume <= 0) {
          clearInterval(fadeOutInterval);
          oldAudio.pause();

          if (newMusicPath) {
            const newAudio = new Audio(newMusicPath);
            newAudio.loop = true;
            newAudio.volume = 0;

            newAudio
              .play()
              .then(() => {
                let newVolume = 0;
                const fadeInInterval = setInterval(() => {
                  newVolume = Math.min(0.5, newVolume + 0.05); // Поступово збільшуємо гучність нової музики
                  newAudio.volume = newVolume;
                  if (newVolume >= 0.5) {
                    clearInterval(fadeInInterval);
                    finish(newAudio);
                  }
                }, 100);
              })
              .catch((err) => {
                console.warn("Audio play failed:", err);
                finish(null);
              });
          } else {
            finish(null);
          }
        }
      }, 100);
    } else if (newMusicPath) {
      const newAudio = new Audio(newMusicPath);
      newAudio.loop = true;
      newAudio.volume = 0;

      newAudio
        .play()
        .then(() => {
          let volume = 0;
          const fadeInInterval = setInterval(() => {
            volume = Math.min(0.5, volume + 0.05);
            newAudio.volume = volume;
            if (volume >= 0.5) {
              clearInterval(fadeInInterval);
              finish(newAudio);
            }
          }, 100);
        })
        .catch((err) => {
          console.warn("Audio play failed:", err);
          finish(null);
        });
    } else {
      finish(null);
    }
  };

  // Використовуємо useEffect для зміни музики в залежності від сцени
  useEffect(() => {
    if (!hasInteracted) return;

    const currentScene = dialogueData.find(
      (scene) => scene.id === currentSceneId
    );
    if (!currentScene) return;

    if (currentScene.music && currentScene.music !== currentMusicRef.current) {
      fadeAudio(audioRef.current, currentScene.music, (newAudio) => {
        audioRef.current = newAudio;
        currentMusicRef.current = currentScene.music!;
      });
    } else if (!currentScene.music && currentMusicRef.current) {
      fadeAudio(audioRef.current, null, () => {
        audioRef.current = null;
        currentMusicRef.current = "";
      });
    }
  }, [currentSceneId, hasInteracted]);

  // Очищення музики при демонтажі компонента
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Знаходимо поточну сцену в масиві діалогів
  const currentScene: DialogueScene | undefined = dialogueData.find(
    (scene) => scene.id === currentSceneId
  );

  // Функція для переходу до наступної сцени
  const goToScene = (nextSceneId: string) => {
    const nextScene = dialogueData.find((s) => s.id === nextSceneId);
    if (nextScene && currentScene) {
      if (nextScene.resetHistory) {
        setHistory([]); // Якщо сцена скидає історію
      } else if (currentScene.canGoBack) {
        setHistory((prev) => [...prev, currentScene.id]); // Додаємо поточну сцену в історію
      }
      setCurrentSceneId(nextSceneId);
    }
  };

  // Функція для повернення до попередньої сцени
  const goBack = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1)); // Видаляємо останню сцену з історії
    setCurrentSceneId(last);
  };

  // Обробка важливих виборів, які впливають на кінцівку гри
  const handleMakeImportantChoice = (choiceId: string) => {
    setImportantChoices((prev) => new Set(prev).add(choiceId));
  };

  // Визначення кінцівки гри в залежності від виборів гравця
  const determineEnding = () => {
    if (importantChoices.has("Примкнути до темних")) {
      setCurrentSceneId("bad-ending");
    } else if (
      importantChoices.has("Напасти першими") &&
      importantChoices.has("Поміг магу")
    ) {
      setCurrentSceneId("neutral-ending");
    } else if (importantChoices.has("Напасти першими")) {
      setCurrentSceneId("neutral-good-ending");
    } else if (importantChoices.has("Поміг магу")) {
      setCurrentSceneId("good-ending");
    } else {
      setCurrentSceneId("bad-final");
    }
  };

  // Якщо сцена не знайдена, відображаємо повідомлення
  if (!currentScene) {
    return <div>Сцену не знайдено</div>;
  }

  // Вибір того, чи є можливість перейти до фіналу, чи ще треба взаємодіяти
  return (
    <div>
      {currentScene.next === "final" ? (
        <TextArea
          scene={currentScene}
          onNext={determineEnding}
          onOptionClick={() => {}}
          onBack={() => {}}
          canGoBack={false}
          onMakeImportantChoice={() => {}}
          importantChoices={importantChoices}
        />
      ) : (
        <TextArea
          scene={currentScene}
          onNext={(id) => {
            if (!currentScene.options) {
              goToScene(id);  // Перехід до наступної сцени
            }
          }}
          onOptionClick={(nextId, choiceId) => {
            if (choiceId) handleMakeImportantChoice(choiceId); // Вибір важливої опції
            goToScene(nextId);
          }}
          onBack={goBack} // Функція для повернення назад
          canGoBack={history.length > 0} // Перевірка, чи є куди повернутись
          onMakeImportantChoice={handleMakeImportantChoice} // Обробка важливих виборів
          importantChoices={importantChoices}
        />
      )}
    </div>
  );
}
