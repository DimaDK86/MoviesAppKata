import React, { useState, useEffect } from "react";
import { Flex, Layout, Tabs, Pagination, Spin, Alert } from "antd";
import MovieList from "../movieList/MovieList";
import "./App.css";
import HeadreSearch from "../headerSearch/HeadreSearch";
import MovieDBService from "../../services/MovieDBService";

const { Header, Footer, Content } = Layout;

const headerStyle = {
  textAlign: "center",
  color: "#000",
  backgroundColor: "#fff",
  padding: 33,
  paddingBottom: 0,
};

const footerStyle = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "#fff",
};

const layoutStyle = {
  margin: "0, auto",
  overflow: "hidden",
  maxWidth: "1010px",
  minWidth: "420px",
  backgroundColor: "#fff",
};

const App = () => {
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [load, setLoad] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [ratedMovies, setRatedMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [movieRatings, setMovieRatings] = useState({});
  const movieDB = MovieDBService.getInstance();

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      const searchResults = async () => {
        if (searchValue) {
          setLoad(true);
          setTotalPages(0);
          setMovies([]);
          setPage(1);
          const data = await movieDB.searchMovies(searchValue, 1);
          setMovies(data.movies);
          setTotalPages(data.totalPages);
          setLoad(false);
          setPage(1);
          console.log("всего страниц " + totalPages);
        } else {
          setMovies([]);
          setTotalPages(0);
        }
      };
      searchResults();
    }, 500);

    setDebounceTimeout(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchValue]);

  const fetchMovies = async () => {
    setLoad(true);
    setError(null);
    setNetworkError(false);
    try {
      const data = await movieDB.getAllMovies(page);
      setMovies(data.movies);
      setTotalPages(data.totalPages);
    } catch (err) {
      if (err.message === "Network Error") {
        setNetworkError(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (!searchValue) {
      fetchMovies();
    }
  }, [page, searchValue]);

  const onChangeTab = (key) => {
    setActiveTab(key);
    if (key === "1") {
      setPage(1);
      if (searchValue) {
        movieDB.searchMovies(searchValue, 1).then((data) => {
          setMovies(data.movies);
          setTotalPages(data.totalPages);
        });
      } else {
        fetchMovies();
      }
    } else {
      setPage(1);
      fetchRatedMovies(1);
    }
  };

  const handlePageChange = async (newPage) => {
    if (activeTab === "1") {
      setPage(newPage);
      if (searchValue) {
        const data = await movieDB.searchMovies(searchValue, newPage);
        setMovies(data?.movies || []);
        setTotalPages(data?.totalPages || 0);
      } else {
        const data = await movieDB.getAllMovies(newPage);
        setMovies(data?.movies || []);
        setTotalPages(data?.totalPages || 0);
      }
    } else {
      setPage(newPage);
      await fetchRatedMovies(newPage);
    }
  };

  const items = [
    {
      key: "1",
      label: "Поиск",
      children: <HeadreSearch onSearchChange={setSearchValue} />,
    },
    {
      key: "2",
      label: "Рейтинги",
    },
  ];

  const fetchRatedMovies = async (page = 1) => {
    setLoad(true);
    try {
      const data = await movieDB.getRatedMovies(page);
      if (!data || !data.movies) {
        setMovies([]);
        setTotalPages(0);
        return;
      }

      setRatedMovies(data.movies.map((movie) => movie.id));
      setMovies(data.movies);
      setTotalPages(data.totalPages || 1);

      const ratings = {};
      data.movies.forEach((movie) => {
        ratings[movie.id] = movie.rating || movie.myRating || 0;
      });
      setMovieRatings(ratings);
    } catch (err) {
      console.error("Error fetching rated movies:", err);
      setError(err.message);
      setMovies([]);
    } finally {
      setLoad(false);
    }
  };

  const handleRateMovie = async (movieId, myRating) => {
    await movieDB.rateMovie(movieId, myRating);
    setMovieRatings((prevRatings) => ({
      ...prevRatings,
      [movieId]: myRating,
    }));
  };

  const filteredMovies =
    activeTab === "2"
      ? movies.filter((movie) => ratedMovies.includes(movie.id))
      : movies;

  return (
    <Flex wrap>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}>
          <Tabs
            defaultActiveKey="1"
            activeKey={activeTab}
            items={items}
            onChange={onChangeTab}
          />
        </Header>
        <Content>
          {load ? (
            <div
              style={{ display: "flex", justifyContent: "center", padding: 20 }}
            >
              <Spin size="large" />
            </div>
          ) : networkError ? (
            <Alert
              message="Ошибка сети"
              description="Пожалуйста, проверьте подключение к интернету."
              type="error"
              showIcon
            />
          ) : error ? (
            <Alert message="Ошибка" description={error} type="error" showIcon />
          ) : activeTab === "1" ? (
            <MovieList
              movieRatings={movieRatings}
              movies={filteredMovies}
              onRateMovie={handleRateMovie}
            />
          ) : (
            <MovieList
              movieRatings={movieRatings}
              movies={movies.filter((movie) => ratedMovies.includes(movie.id))}
              onRateMovie={handleRateMovie}
            />
          )}
        </Content>
        <Footer style={footerStyle}>
          <>
            <Pagination
              current={page}
              total={totalPages * 10}
              showSizeChanger={false}
              showTotal={false}
              onChange={handlePageChange}
            />
          </>
        </Footer>
      </Layout>
    </Flex>
  );
};

export default App;
