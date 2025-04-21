import React, { useState } from "react";

const HeadreSearch = ({ onSearchChange }) => {
  const [value, setValue] = useState("");
  const onValueChange = (e) => {
    const newValue = e.target.value; // Получаем новое значение
    setValue(newValue); // Обновляем состояние
    onSearchChange(newValue); // Передаем новое значение в родительский компонент
    console.log(value);
  };
  return (
    <div>
      <input
        className="inputSearch"
        placeholder="Введите для поиска..."
        onChange={onValueChange}
        name="value"
        value={value}
      />
    </div>
  );
};

export default HeadreSearch;
