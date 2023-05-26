import { React, useState, Fragment } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Zoom,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { theme } from "../../../theme";
import { ApiEndpoints } from "../../../api/endpoints";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { noPermissionsForOperationMessage } from "../../../constants";

export default function UndeleteUser(props) {
  let axiosPrivate = useAxiosPrivate();

  const [user, setUser] = useState(props.user);
  const [undeleteUserResponseMessage, setUndeleteUserResponseMessage] =
    useState("");
  const [undeleteUserErrorMessage, setUndeleteUserErrorMessage] = useState("");
  const [isUndeleted, setIsUndeleted] = useState(false);

  function onUndeleteUser() {
    undeleteUser(user.id);
  }

  const ErrorAlert = styled(Alert)({
    fontWeight: 500,
    color: theme.palette.error.main,
  });

  async function undeleteUser(userId) {
    try {
      const controller = new AbortController();
      const response = await axiosPrivate.post(
        ApiEndpoints.users.undeleteUser,
        JSON.stringify({ id: userId }),
        {
          signal: controller.signal,
        }
      );

      controller.abort();

      setUndeleteUserErrorMessage("");
      setUndeleteUserResponseMessage("User " + user.email + " undeleted!");

      setIsUndeleted(true);
      props.updateUser(response?.data);
      console.log(response?.data);
    } catch (error) {
      setUndeleteUserResponseMessage("");
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setUndeleteUserErrorMessage(noPermissionsForOperationMessage);
      } else {
        setUndeleteUserErrorMessage("Error!");
      }
      console.log(error.message);
    }
  }

  const UndeleteUserButton = styled(Button)({
    width: "100%",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  });

  const ButtonsHolder = styled(Box)({
    display: "flex",
    width: "100%",
    margin: "auto",
    gap: 60,
    justifyContent: "center",
  });

  return (
    <Paper sx={{ padding: theme.spacing(2), marginTop: theme.spacing(2) }}>
      <Box
        sx={{
          textAlign: "center",
          marginLeft: theme.spacing(4),
          marginTop: theme.spacing(3),
        }}
      >
        <Typography variant="h6">
          Do you want to reveal user {user.email.toUpperCase()}!
        </Typography>
      </Box>
      <ButtonsHolder>
        <UndeleteUserButton
          onClick={onUndeleteUser}
          type="submit"
          size="large"
          variant="contained"
          color="primary"
          disabled={isUndeleted ? true : false}
        >
          UNDELETE USER
        </UndeleteUserButton>
        <UndeleteUserButton
          onClick={props.onUndeleteCancelButtonClicked}
          type="submit"
          size="large"
          variant="outlined"
          color="primary"
        >
          CANCEL
        </UndeleteUserButton>
      </ButtonsHolder>
      {undeleteUserResponseMessage ? (
        <Zoom in={undeleteUserResponseMessage.length > 0 ? true : false}>
          <Alert sx={{ marginTop: theme.spacing(1) }} severity="success">
            {undeleteUserResponseMessage}
          </Alert>
        </Zoom>
      ) : (
        <></>
      )}
      {undeleteUserErrorMessage ? (
        <Zoom in={undeleteUserErrorMessage.length > 0 ? true : false}>
          <ErrorAlert sx={{ marginTop: theme.spacing(1) }} severity="error">
            {undeleteUserErrorMessage}
          </ErrorAlert>
        </Zoom>
      ) : (
        ""
      )}
    </Paper>
  );
}