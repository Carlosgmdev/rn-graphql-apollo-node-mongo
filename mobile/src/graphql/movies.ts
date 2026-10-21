import { gql, type TypedDocumentNode } from "@apollo/client";

export type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  averageRating: number | null;
  ratingsCount: number;
};

type GetMoviesData = {
  movies: Movie[];
};

export const GET_MOVIES: TypedDocumentNode<
  GetMoviesData,
  Record<string, never>
> = gql`
  query GetMovies {
    movies {
      id
      title
      director
      year
      averageRating
      ratingsCount
    }
  }
`;
