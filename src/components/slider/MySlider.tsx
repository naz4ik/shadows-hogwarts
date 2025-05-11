import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import "./MySliderStyles.scss";

export function MySlider() {
  // Ініціалізація слайдера KeenSlider
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true, // Зациклення слайдера
    slides: { perView: 0.5 }, // Кількість слайдів, що видно одночасно
    created(slider) {
      setSliderInstance(slider); // Зберігаємо інстанс слайдера для керування
    },
  });

  const [sliderInstance, setSliderInstance] = useState<any>(null); // Зберігаємо інстанс слайдера
  const [isPaused, setIsPaused] = useState(false); // Стан для паузи автоперемикання

  // Перехід до попереднього слайду
  const handlePrevSlide = () => sliderInstance?.prev();
  // Перехід до наступного слайду
  const handleNextSlide = () => sliderInstance?.next();

  // Автоматичне перемикання слайдів кожні 5 секунд, якщо не на паузі
  useEffect(() => {
    if (!sliderInstance || isPaused) return;

    const intervalId = setInterval(() => {
      sliderInstance.next(); // Перемикаємо на наступний слайд
    }, 5000);

    return () => clearInterval(intervalId); // Очищення таймера при зміні
  }, [sliderInstance, isPaused]);

  // Ставимо на паузу при наведенні
  const handleMouseEnter = () => setIsPaused(true);
  // Знімаємо з паузи при виході мишки
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <>
      <div
        className="outerSliderWrapper"
        onMouseEnter={handleMouseEnter} // Навели мишку — пауза
        onMouseLeave={handleMouseLeave} // Вивели мишку — продовження
      >
        {/* Кнопка назад */}
        <button onClick={handlePrevSlide} className="customPrev">
          &lt;
        </button>

        {/* Обгортка для слайдера */}
        <div className="sliderWrapper">
          <div ref={sliderRef} className="keen-slider sliderContainer">
            <div className="keen-slider__slide">
              <img
                src="/screens/screen-3.png"
                alt="1"
                className="slide_Image zeroSlide"
              />
            </div>
            <div className="keen-slider__slide">
              <img
                src="/screens/screen-2.png"
                alt="2"
                className="slide_Image firstSlide"
              />
            </div>
            <div className="keen-slider__slide">
              <img
                src="/screens/screen-1.png"
                alt="3"
                className="slide_Image secondSlide"
              />
            </div>
          </div>
        </div>

        {/* Кнопка вперед */}
        <button onClick={handleNextSlide} className="customNext">
          &gt;
        </button>
      </div>
    </>
  );
}
