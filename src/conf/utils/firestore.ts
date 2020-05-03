import firebase from "firebase";
import "firebase/firestore";

export const getMeetings = (
  uid: string
): Promise<
  {
    id: string;
    roomId: string;
    meetWith: string;
    roomType: "sfu" | "mesh";
    createdAt: Date;
  }[]
> =>
  firebase
    .firestore()
    .collection("chats")
    .doc(uid)
    .collection("rooms")
    .get()
    .then((snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        roomId: d.data().roomId as string,
        meetWith: d.data().meetWith as string,
        roomType: d.data().roomType,
        createdAt: new Date(d.data().createdAt),
      }));
      return data;
    });
