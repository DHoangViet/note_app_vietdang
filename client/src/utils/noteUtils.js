import { graphqlRequest } from "./request";

export const notesLoader = async ({ params: { folderId } }) => {
  const query = `query Folder($folderId: String!) {
      folder(folderId: $folderId) {
        id
        name
        notes {
          content
          id
          updatedAt
        }
      }
    }                  
    `;
  const data = await graphqlRequest({
    query,
    variables: {
      folderId,
    },
  });
  return data;
};
export const noteLoader = async ({ params: { noteId } }) => {
  const query = `query Note($noteId: String) {
      note(noteId: $noteId) {
        content
        id
      }
    }                  
    `;
  const data = await graphqlRequest({
    query,
    variables: {
      noteId,
    },
  });
  return data;
};

export const addNewNote = async ({ params, request }) => {
  const newFolder = await request.formData();
  const formDataObject = {};
  newFolder.forEach((value, key) => (formDataObject[key] = value));

  const query = `mutation Mutation($content: String!, $folderId: ID!) {
    addNote(content: $content, folderId: $folderId) {
      id
      content
    }
  }`;
  const { addNote } = await graphqlRequest({
    query,
    variables: formDataObject,
  });

  return addNote;
};

export const updateNote = async ({ params, request }) => {
  const updatedNote = await request.formData();
  const formDataObject = {};
  updatedNote.forEach((value, key) => (formDataObject[key] = value));
  const query = `mutation Mutation($id: String!, $content: String!){
    updateNote(id: $id, content: $content){
      id
      content
    }
  }`;
  const { updateNote } = await graphqlRequest({
    query,
    variables: formDataObject,
  });
  return updateNote;
};
