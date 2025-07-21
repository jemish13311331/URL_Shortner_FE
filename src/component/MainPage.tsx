import { useEffect, useState } from "react";
import "./MainPage.css";
import { fetchData, postData, putData } from "../apicaller/apicaller";

interface list {
  base_url: string;
  created_at: string;
  id: number;
  shorten_id: string;
  visit_count: number;
}

interface editMode {
  id: number;
  flag: boolean;
  newSlug: string;
}

//only page in the App that renders the listing of URLs and form to generate the url
export const MainPage = () => {
  const [url, setUrl] = useState<string>("");
  const [shortenId, setShortenId] = useState<string>("");
  const [copy, setCopy] = useState<string>("Copy");
  const [shortenList, setShortenList] = useState<list[]>([]);
  const [slugLength, setSlugLength] = useState<Number>(7);
  const [loader, setLoader] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<editMode>({
    id: 0,
    flag: false,
    newSlug: "",
  });

  //to create the shorten URL
  const onSubmit = async (url: string) => {
    const pattern = new RegExp(
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
      "i"
    );
    if (url.trim().length === 0 || !pattern.test(url)) {
      return alert("Please enter the valid URL");
    } else {
      const res = await postData("url-shortner", { url: url, slugLength });

      if (res && res.status === 200) {
        setShortenId(
          `${process.env.REACT_APP_API_URL}au/${res?.data[0]?.shorten_id}`
        );
      } else {
        alert(res?.statusText);
      }
      await fetchURLs();
    }
  };

  //to copy the shorten URL
  const onCopy = () => {
    navigator.clipboard?.writeText(shortenId);
    setCopy("Copied");
  };

  //to fetch the listing of the URL
  const fetchURLs = async () => {
    await setLoader(true);
    await fetchData("shorten-list", {}).then((res) =>
      setShortenList(res?.data)
    );
    await setLoader(false);
  };

  //to edit the slug
  const editSlugClick = (id: number) => {
    if (id > 0) {
      setEditMode((prev) => ({ ...prev, flag: true, id: id }));
    }
  };

  //to make the api request on edit
  const onEditSubmit = async (newSlug: string, slug: string) => {
    if (newSlug?.length < 7 || newSlug?.length > 9) {
      alert("Length should be in between 7 to 9 characters");
    } else {
      const res = await putData("edit-slug", { newSlug, slug });
      if (res && res?.status === 200 && res?.data?.rowCount === 1) {
        await setEditMode({ id: 0, flag: false, newSlug: "" });
        await fetchURLs();
      }
    }
  };

  //to load all urls after page is rendered
  useEffect(() => {
    fetchURLs();
  }, []);

  return (
    <div className="main-container">
      <div className="title">🔗 URL Shortner 🔗</div>
      <input
        placeholder="Please enter your URL"
        onChange={(e) => setUrl(e?.target?.value)}
      />
      <select onChange={(e) => setSlugLength(Number(e?.target?.value))}>
        <option value="" disabled>
          Please select length of the slug
        </option>
        <option value={7}>7 (Default Length of the Slug)</option>
        <option value={8}>8</option>
        <option value={9}>9</option>
      </select>
      <button onClick={() => onSubmit(url)}>Shorten</button>

      {shortenId && (
        <div className="result">
          Shortened URL:{" "}
          <a href={shortenId} target="_blank" rel="noreferrer">
            {shortenId}
          </a>
          <button onClick={() => onCopy()}>{copy}</button>
        </div>
      )}

      <div className="title">List of shorten URLs</div>
      <div className="shorten-list">
        {loader
          ? "loading"
          : shortenList?.map((item, key) => {
              return (
                <table id={key?.toString()}>
                  <tbody>
                    <tr>
                      <td>
                        <b>Shorten URL:</b>
                      </td>
                      <td>
                        <a
                          href={`${process.env.REACT_APP_API_URL}au/${item?.shorten_id}`}
                          target="_blank"
                          rel="noreferrer"
                        >{`${process.env.REACT_APP_API_URL}au/${item?.shorten_id}`}</a>{" "}
                        <span
                          className="edit-box"
                          tabIndex={0}
                          onClick={() => editSlugClick(item.id)}
                        >
                          {editMode?.flag && editMode?.id === item?.id ? (
                            <>
                              {" "}
                              <input
                                placeholder="Please enter the new slug"
                                onChange={(e) =>
                                  setEditMode((prev) => ({
                                    ...prev,
                                    newSlug: e?.target?.value,
                                  }))
                                }
                              />
                              <button
                                onClick={() =>
                                  onEditSubmit(
                                    editMode?.newSlug,
                                    item?.shorten_id
                                  )
                                }
                              >
                                Edit
                              </button>
                            </>
                          ) : (
                            <span className="edit-icon">✎</span>
                          )}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b>Base URL:</b>
                      </td>
                      <td>
                        <a href={shortenId} target="_blank" rel="noreferrer">
                          {item.base_url}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b>Created AT:</b>
                      </td>
                      <td>{item.created_at}</td>
                    </tr>
                    <tr>
                      <td>
                        <b>Number of Visits:</b>
                      </td>
                      <td>{item.visit_count}</td>
                    </tr>
                  </tbody>
                </table>
              );
            })}
      </div>
    </div>
  );
};
