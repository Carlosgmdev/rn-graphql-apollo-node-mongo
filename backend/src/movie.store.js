import { DomainError } from "./store.js";

function toMovie(movie) {
  const ratingsCount = movie.ratings.length;

  const averageRating =
    ratingsCount === 0
      ? null
      : movie.ratings.reduce((sum, rating) => sum + rating, 0) / ratingsCount;

  return {
    id: movie.id,
    title: movie.title,
    director: movie.director,
    year: movie.year,
    averageRating,
    ratingsCount,
  };
}

export function createMovieStore() {
  // Datos ficticios para practicar listas grandes sin depender de una API externa.
  const titlePrefixes = [
    "El secreto de",
    "Las luces de",
    "El regreso a",
    "Una noche en",
    "Los recuerdos de",
    "El misterio de",
    "Las sombras de",
    "El camino hacia",
    "Las voces de",
    "El último tren hacia",
  ];
  const titleSettings = [
    "la ciudad perdida",
    "la estación del norte",
    "el bosque azul",
    "la isla del silencio",
    "el puerto de invierno",
    "la frontera del tiempo",
    "el valle de cristal",
    "la casa del faro",
    "el planeta distante",
    "la montaña de fuego",
  ];
  const sampleDirectors = [
    "Lucía Valverde",
    "Mateo Solís",
    "Elena Robles",
    "Andrés Luján",
    "Clara Montiel",
    "Diego Aranda",
    "Sofía Beltrán",
    "Tomás Olmedo",
    "Marina Castaño",
    "Gabriel Linares",
  ];

  const movies = [
    {
      id: "m1",
      title: "Interstellar",
      director: "Christopher Nolan",
      year: 2014,
      ratings: [],
    },
    {
      id: "m2",
      title: "Spirited Away",
      director: "Hayao Miyazaki",
      year: 2001,
      ratings: [],
    },
    {
      id: "m3",
      title: "Arrival",
      director: "Denis Villeneuve",
      year: 2016,
      ratings: [],
    },
    ...titlePrefixes.flatMap((prefix, prefixIndex) =>
      titleSettings.map((setting, settingIndex) => {
        const index = prefixIndex * titleSettings.length + settingIndex;

        return {
          id: `m${index + 4}`,
          title: `${prefix} ${setting}`,
          director: sampleDirectors[(prefixIndex + settingIndex) % sampleDirectors.length],
          year: 1990 + (index % 35),
          ratings: [],
        };
      }),
    ),
  ];

  return {
    listMovies() {
      return movies.map(toMovie);
    },

    findMovie(id) {
      const movie = movies.find((item) => item.id === id);
      return movie ? toMovie(movie) : null;
    },

    rateMovie({ movieId, rating }) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new DomainError(
          "La calificacion debe ser un entero entre 1 y 5",
          "BAD_USER_INPUT",
        );
      }

      const movie = movies.find((m) => m.id === movieId);
      if (!movie) throw new DomainError("La pelicula no existe", "NOT_FOUND");

      movie.ratings.push(rating);
      return toMovie(movie);
    },
  };
}
