import { BackButton } from "@/components/BackButton/BackButton";
import { Box } from "@/components/Box/Box";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";

const Projects = () => {
  return (
    <PageWrapper fullScreen>
      <BackButton href="/" text="Назад" />
      <SectionHeader>Проекти</SectionHeader>
      <Box
        linkUrl="/projects/getmynumber"
        title="Найгірші інпути"
        description="Я вирішив і собі зробити невеличеий челендж і поекспериментувати. До вашої уваги... НАЙГІРШІ ІНПУТИ"
      />
      <Box
        linkUrl="/projects/sudoku"
        title="Судоку"
        description="Класична головоломка з цифрами. Заповни сітку так, щоб кожна цифра від 1 до 9 зустрічалась лише раз у рядку, стовпці та квадраті 3×3."
      />
      <Box
        linkUrl="/projects/memory-path-game"
        title="Шлях пам’яті"
        description="Запам’ятайте шістнадцять чисел, а потім проведіть шлях літерами, який у сумі дає ціль."
      />
      <Box
        linkUrl="/projects/scale-game"
        title="Гра з терезами"
        description="П’ять кольорів мають приховану вагу. Ставте блоки на терези й виведіть числа, бачачи лише, яка шалька важча."
      />
    </PageWrapper>
  );
};

export default Projects;
