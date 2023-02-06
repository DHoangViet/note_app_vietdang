import { NoteAddOutlined } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  List,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from 'moment'
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import {
  Link,
  Outlet,
  useParams,
  useLoaderData,
  useSubmit,
  useNavigate,
} from "react-router-dom";

export default function NoteList() {
  const { folder } = useLoaderData();
  const { noteId, folderId } = useParams();
  const [noteActiveId, setNoteActiveId] = useState(noteId);
  const submit = useSubmit();
  const navigate = useNavigate();

  useEffect(() =>{
    if(noteId){
      setNoteActiveId(noteId);
      return;
    }

    if(folder?.notes?.[0]){
      navigate(`note/${folder.notes[0].id}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, folder.notes])

  const handleAddNote = () => {
    submit(
      {
        content: "",
        folderId,
      },
      { method: "post", action: `/folders/${folderId}` }
    );
  };

  return (
    <>
      <Grid container height="100%">
        <Grid
          item
          xs={4}
          sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "#f0EBE3",
            height: "100%",
            overflowY: "auto",
            padding: "10px",
            textAlign: "left",
          }}
        >
          <List
            subheader={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Notes</Typography>
                <Tooltip title="Add Note" onClick={handleAddNote}>
                  <IconButton size="small">
                    <NoteAddOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            {folder.notes.map(({ id, content, updatedAt }) => {
              return (
                <Link
                  key={id}
                  to={`note/${id}`}
                  style={{ textDecoration: "none" }}
                  onClick={() => setNoteActiveId(id)}
                >
                  <Card
                    sx={{
                      mb: "5px",
                      backgroundColor:
                        id === noteActiveId ? "rgba(255,211,140)" : null,
                    }}
                  >
                    <CardContent
                      sx={{ "&:last-child": { pb: "10px" }, padding: "10px" }}
                    >
                      <div
                        style={{ fontSize: 14, fontWeight: "bold" }}
                        dangerouslySetInnerHTML={{
                          __html: `${content.substring(0, 30) || "Empty"}`,
                        }}
                      ></div>
                      <Typography sx={{fontSize: '10px'}}>
                      {moment(updatedAt).format('MMMM Do YYYY, h:mm:ss a')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </List>
        </Grid>
        <Grid item xs={8}>
          <Outlet />
        </Grid>
      </Grid>
    </>
  );
}
