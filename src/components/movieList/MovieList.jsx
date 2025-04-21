import React from "react";
import { Card, Flex, Alert, Rate } from "antd";

const MovieList = ({ movies, onRateMovie, movieRatings }) => {
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      locale: "ru-RU",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", options);
  };

  const colorRating = (rating) => {
    let res = "";
    if (rating <= 3) {
      return (res = "#E90000");
    } else if (rating > 3 && rating <= 5) {
      return (res = "#E97E00");
    } else if (rating > 5 && rating <= 7) {
      return (res = "#E9D100");
    } else {
      res = "#66E900";
    }
    return res;
  };

  const movieItems = movies.map((item) => (
    <Card key={item.id}>
      <Flex>
        <div
          className="cardImages"
          style={{
            height: 281,
            flex: "0 0 183px",
          }}
        >
          <img
            style={{ width: "100%", height: "100%" }}
            src={item.poster}
            alt={item.title}
          />
        </div>
        <div className="cardInfo">
          <div className="cardInfoInfo">
            <div className="cardTitle" style={{ display: "flex" }}>
              <h3>{item.title}</h3>
              <div
                style={{
                  border: `2px solid ${colorRating(item.rating)}`,
                }}
                className="ratingElips"
              >
                {item.rating.toFixed(1)}
              </div>
            </div>
            <div className="data">{formatDate(item.releaseDate)}</div>
            <div className="genres">
              {item.genreIds.slice(0, 2).map((item, index) => (
                <span key={index} className="genre">
                  {item}
                </span>
              ))}
            </div>
            <div className="overview">
              {item.overview.length < 1
                ? "Описание отсутствует"
                : item.overview}
            </div>
          </div>
          <div className="raitingStar">
            <Rate
              allowHalf
              count={10}
              value={movieRatings[item.id] || 0} // Устанавливаем значение рейтинга
              onChange={(value) => onRateMovie(item.id, value)} // Вызов функции при оценке
            />
          </div>
        </div>
      </Flex>
    </Card>
  ));

  return (
    <Flex style={{ gap: "36px", padding: "33px", background: "#FFFFFF" }} wrap>
      {movieItems.length < 1 ? (
        <Alert
          style={{ width: "100%" }}
          message="К сожалению, фильмы не найдены"
          type="warning"
          showIcon
          closable
        />
      ) : (
        movieItems
      )}
    </Flex>
  );
};

export default MovieList;
