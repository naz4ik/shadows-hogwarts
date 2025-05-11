import React, { useEffect, useState, useRef } from "react";
import styles from "./TextAreaStyles.module.scss";
import type { DialogueScene } from "../../types/DialogueScene";

// Пропси, які отримує компонент
interface TextAreaProps {
  scene: DialogueScene;
  onBack: () => void;
  onNext: (nextSceneId: string) => void;
  onOptionClick: (nextSceneId: string, choice?: string) => void;
  canGoBack: boolean;
  onMakeImportantChoice: (choiceId: string) => void;
  importantChoices: Set<string>;
}

export const TextArea: React.FC<TextAreaProps> = ({
  scene,
  onNext,
  onBack,
  canGoBack,
  onMakeImportantChoice,
  importantChoices,
  onOptionClick,
}) => {
  // Стан тексту, що поступово з'являється
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false); // Чи завершено анімацію набору тексту
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const prevPersonageImageRef = useRef<string | null>(null); // Посилання на попереднє зображення персонажа
  const [shouldAnimate, setShouldAnimate] = useState(true); // Чи анімувати появу персонажа
  const audioRef = useRef<HTMLAudioElement | null>(null); // Посилання на аудіо

  // Програвання або зупинка музики при зміні сцени
  useEffect(() => {
    if (scene.music) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = scene.music;
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.warn("Audio play blocked or failed:", err);
        });
      } else {
        audioRef.current = new Audio(scene.music);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch((err) => {
          console.warn("Audio play failed:", err);
        });
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [scene.music]);

  // Ефект для набору тексту, блокування скролу і анімації
  useEffect(() => {
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("scroll", preventScroll, { passive: false });

    if (!scene || typeof scene.text !== "string") {
      setDisplayedText("");
      setIsTypingDone(true);
      return;
    }

    const currentPersonageImage = scene.personageImage || null;
    const personageChanged =
      currentPersonageImage !== prevPersonageImageRef.current;

    prevPersonageImageRef.current = currentPersonageImage;

    setShouldAnimate(personageChanged);
    setDisplayedText("");
    setIsTypingDone(false);
    setCurrentSceneId(scene.id);

    let index = -1;

    // Функція для поступового виводу символів
    const typeCharacter = () => {
      index++;
      if (index < scene.text.length) {
        setDisplayedText((prev) => prev + scene.text.charAt(index));
        setTimeout(typeCharacter, 25); // затримка між символами
      } else {
        setIsTypingDone(true); // набір завершено
      }
    };

    typeCharacter();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("scroll", preventScroll);
    };
  }, [scene]);

  // Перехід до наступної сцени, якщо є
  const handleButtonClick = () => {
    if (scene.next) {
      onNext(scene.next);
    }
  };

  return (
    <div
      className={styles.textArea}
      style={
        scene.backgroundImage
          ? { backgroundImage: `url(${scene.backgroundImage})` }
          : scene.backgroundColor
          ? { backgroundColor: scene.backgroundColor }
          : {}
      }
    >
      {/* Затемнення/оверлей */}
      <div
        className={`${styles.overlay} ${
          scene.options && isTypingDone && currentSceneId === scene.id
            ? styles.overlayVisible
            : ""
        }`}
      />

      {/* Зображення персонажа */}
      {scene.personageImage && (
        <img
          src={scene.personageImage}
          alt="Personage"
          className={`${styles.personage} ${
            shouldAnimate ? styles.personageVisible : styles.personageStatic
          }`}
          key={shouldAnimate ? scene.id : "static-personage"}
        />
      )}

      {/* Кнопка назад */}

      <button
        className={`${styles.arrowButton} ${styles.arrowLeft}`}
        onClick={onBack}
        disabled={!canGoBack || !isTypingDone}
      >
        &lt;
      </button>

      {/* Ім'я та текст діалогу */}
      <div className={styles.nameAndDialogueWrapper}>
        <p className={styles.personageName}>{scene.personageName}</p>
        <div className={styles.dialogueBox}>
          <p className={styles.dialogText}>{displayedText}</p>
        </div>
      </div>

      {/* Відображення варіантів вибору */}
      <div className={styles.optionStyles}>
        {scene.options && isTypingDone && currentSceneId === scene.id && (
          <div className={styles.options}>
            {scene.options.map((option, index) => {
              const isAvailable =
                !option.condition || option.condition(importantChoices);
              const buttonClassName = isAvailable
                ? ""
                : styles.unavailableOption;

              const handleClick = () => {
                if (isAvailable) {
                  if (option.importantChoice) {
                    onMakeImportantChoice(option.importantChoice);
                  }
                  onOptionClick(option.nextSceneId, option.text);
                }
              };

              return (
                <button
                  key={index}
                  onClick={handleClick}
                  className={buttonClassName}
                  disabled={!isAvailable}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Кнопка вперед */}
      <button
        className={`${styles.arrowButton} ${styles.arrowRight}`}
        onClick={handleButtonClick}
        disabled={!isTypingDone || !scene.next || !!scene.options}
      >
        &gt;
      </button>
    </div>
  );
};
