
"use strict";

const list = document.querySelector("#movie-list");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const search = document.querySelector("#search");
const genre = document.querySelector("#genre");

let allMovies = [];

// TODO 1. Нормализация
function normalizeMovie(raw) {
  return {
    title: raw.title || "Без названия",
    genre: raw.genre || "Не указан",
    year: raw.year ?? null,
    rating: raw.rating ?? null,
    duration: raw.duration ?? null,
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    tags: Array.isArray(raw.tags) ? raw.tags : []
  };
}

// TODO 2. Отображение карточек
function renderMovies(movies) {
  list.replaceChildren();

  if (!movies.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Фильмы не найдены";
    list.append(empty);
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const info = [
      movie.title,
      `Жанр: ${movie.genre}`,
      `Год: ${movie.year ?? "Не указан"}`,
      `Рейтинг: ${movie.rating ?? "Нет"}`,
      `Длительность: ${movie.duration ?? "Не указана"} мин.`,
      movie.sessions.length
        ? `Сеансы: ${movie.sessions.join(", ")}`
        : "Сеансы пока не назначены",
      `Теги: ${movie.tags.join(", ") || "Нет"}`
    ];

    info.forEach(text => {
      const p = document.createElement("p");
      p.textContent = text;
      card.append(p);
    });

    list.append(card);
  });
}

// TODO 3. Поиск и жанр
function applyFilters() {
  const text = search.value.trim().toLowerCase();

  const filtered = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(text) &&
    (genre.value === "all" || movie.genre === genre.value)
  );

  summary.textContent = `Найдено: ${filtered.length} из ${allMovies.length}`;
  renderMovies(filtered);
}

// TODO 4. GET-запрос
async function fetchMovies(empty = false) {
  try {
    status.textContent = "Загрузка...";

    const response = await fetch(
      "/api/movies" + (empty ? "?empty=1" : "")
    );

    if (!response.ok) throw new Error("Ошибка загрузки");

    const result = await response.json();

    if (!Array.isArray(result.data?.movies)) {
      throw new Error("Неверный формат JSON");
    }

    allMovies = result.data.movies.map(normalizeMovie);
    applyFilters();

    status.textContent = "Данные загружены успешно";
  } catch (error) {
    allMovies = [];
    applyFilters();
    status.textContent = error.message;
  }
}

// Кнопки и фильтры
document.querySelector("#load-button").addEventListener("click", () => fetchMovies());
document.querySelector("#clear-button").addEventListener("click", () => fetchMovies(true));

search.addEventListener("input", applyFilters);
genre.addEventListener("change", applyFilters);

// TODO 5. Начальная загрузка
fetchMovies();

