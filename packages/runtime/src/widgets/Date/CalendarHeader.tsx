import { Edit, CalendarToday } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import {
  PickersCalendarHeaderProps,
  PickersCalendarHeader,
} from "@mui/x-date-pickers";
import { Button, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { DatePickerContext } from "./utils/DatePickerContext";
import { DateHeaderFormat, DateDisplayFormat } from "./utils/DateConstants";

export const CalendarHeader: React.FC<PickersCalendarHeaderProps<any>> = (
  props,
) => {
  const context = useContext(DatePickerContext);
  const [isCalendarOpen, setIsCalendarOpen] = useState(context?.isCalendarOpen);

  const toggleCalendar = (): void => {
    context?.setIsCalendarOpen!(!context?.isCalendarOpen);
    setIsCalendarOpen(!isCalendarOpen);
  };

  const onDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => context?.setEnteredDate?.(e.target.value);

  const getHeaderDate = (): string => {
    const enteredDate = dayjs(context?.enteredDate)?.format(DateHeaderFormat);

    return enteredDate === "Invalid Date"
      ? context?.value?.format(DateHeaderFormat) || ""
      : enteredDate;
  };

  return (
    <>
      <div>
        <h6
          style={{
            margin: "18px 0 18px 24px",
          }}
        >
          SELECT DATE
        </h6>
        <Button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            backgroundColor: "rgb(239, 223, 240)",
            borderColor: "rgb(239, 223, 240)",
            borderBottomColor: "black",
            borderRadius: "0px",
            marginTop: "40px",
            paddingBottom: "20px",
          }}
        >
          <Typography.Text
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginLeft: "8px",
            }}
          >
            {getHeaderDate()}
          </Typography.Text>
          <IconButton onClick={toggleCalendar}>
            {isCalendarOpen ? (
              <Edit
                sx={{
                  color: " black",
                }}
              />
            ) : (
              <CalendarToday
                sx={{
                  color: "black",
                }}
              />
            )}
          </IconButton>
        </Button>
      </div>

      {context?.isCalendarOpen ? (
        <PickersCalendarHeader
          {...props}
          sx={{
            ...props.sx,
            "& .MuiPickersCalendarHeader-root": {
              marginTop: "0px",
            },
          }}
        />
      ) : (
        <TextField
          value={context?.enteredDate}
          placeholder={DateDisplayFormat.toLowerCase()}
          InputLabelProps={{ shrink: true }}
          error={Boolean(context?.errorText) && context?.errorText !== ""}
          helperText={context?.errorText}
          onChange={onDateChange}
          label="Enter Date"
          variant="outlined"
          color="success"
          sx={{
            margin: "24px",
          }}
        />
      )}
    </>
  );
};
