import axios from "axios";

//reusable functio for get APIs
export async function fetchData(end_route: string, params: {}) {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}${end_route}`,
      params
    );
    return res;
  } catch (err) {
    alert(err);
    return { data: [] };
  }
}

//reusable functio for Post APIs
export async function postData(end_route: string, body: {}) {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}${end_route}`,
      body
    );
    return res;
  } catch (err) {
    alert(err);
  }
}

//reusable function for the PUT APIs
export async function putData(end_route: string, body: {}) {
  try {
    const res = await axios.put(
      `${process.env.REACT_APP_API_URL}${end_route}`,
      body
    );
    return res;
  } catch (err) {
    alert(err);
  }
}
