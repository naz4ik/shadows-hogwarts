import { Link } from "react-router-dom";
import { MySlider } from "../../components/slider/MySlider";
import styles from "./HomePageStyles.module.scss";
import { MyButton } from "../../components/MyButton/MyBuuton";

export function HomePage() {
  return (
    <>
      <header>
        {/* логотип */}
        <div className={styles.logotype}>
          <img src="/public/logo/logo.png" alt="logo" className={styles.logo} />
        </div>
      </header>
      {/* Основний вміст сторінки */}
      <body>
        <div className={styles.section}>
          {/* Компонент слайдера */}
          <MySlider />
          <div className={styles.text}>
            <div className={styles.about}>
              {/* Текстова частина з описом історії */}
              <p className={styles.text_about}>
                Ви - студент Хогвартсу, вже настала рання весна і учні відихали
                після пар, але тут почалась злива з блискавками та із-за хмар
                вирвалися чорні постаті — не Дементори, а щось гірше. Це були
                "Бездушні" — давнє плем’я магів, які втратили душу в обмін на
                могутню темну магію. Вони прилетіли з північних земель куди
                навіть сильні маги боялись попасти. Усі думали що це буде на
                декілька днів, але це було не так... Замок вже загублював свої
                сили та ви з іншими учнями повинні допомогти Хогвартсу відбитись
                від чорних магів. Тут вас будуть чекати вибори, які буде тяжко
                прийняти.
              </p>
              {/* Попередження для гравця */}
              <p className={styles.text_Caution}>
                Увага!!! В грі є музика, раджу змінити гучність на 50%. Також,
                щоб перейти на наступну сцену натискайте на стрілку вправо, щоб
                повернутись до якоїсь сцени натисніть кпопку вліво.
              </p>
            </div>
          </div>
          {/* Кнопка для переходу до гри */}
          <Link to={"/game"} className={styles.linkToGame}>
            <MyButton />
          </Link>
        </div>
      </body>
    </>
  );
}
