import { useState, useEffect } from "react";
import "./App.css";
import { ClipboardList, EllipsisVertical, Trash2 } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("all");
  const [inputText, setInputText] = useState("");
  const [listContent, setListContent] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showTaskActions, setShowTaskActions] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [allChecked, setAllChecked] = useState(false);

  // Function for saving each tasks of the user using localStorage.

  useEffect(() => {
    const savedContent = localStorage.getItem("savedContent");
    if (savedContent) {
      setListContent(JSON.parse(savedContent));
    }

    const savedActiveTasks = localStorage.getItem("savedActiveTasks");
    if (savedActiveTasks) {
      setActiveTasks(JSON.parse(savedActiveTasks));
    }

    const savedCompletedTasks = localStorage.getItem("savedCompletedTasks");
    if (savedCompletedTasks) {
      setCompletedTasks(JSON.parse(savedCompletedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedContent", JSON.stringify(listContent));
  }, [listContent]);

  useEffect(() => {
    localStorage.setItem("savedActiveTasks", JSON.stringify(activeTasks));
  }, [activeTasks]);

  useEffect(() => {
    localStorage.setItem("savedCompletedTasks", JSON.stringify(completedTasks));
  }, [completedTasks]);

  // Handlechange function to pass in the respective values/tasks inputed by the user.
  const handleChange = (event) => {
    setInputText(event.target.value);
    event.preventDefault();
  };

  // Button response or when user submits the form.
  const handleClick = (event) => {
    event.preventDefault();
    if (inputText.trim() !== "") {
      setListContent((prevContent) => [...prevContent, inputText]);
      setInputText("");
    }
  };

  // Function for switching between tabs - [All, Active, Completed]
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setAllChecked(false);
    setSelectedTasks([]);
  };

  // Modal's appearance functionality
  const toggleTaskActions = (index) => {
    if (selectedTaskIndex === index) {
      // Close the modal if the same task is clicked again
      setShowTaskActions(false);
      setSelectedTaskIndex(null);
    } else {
      setShowTaskActions(true);
      setSelectedTaskIndex(index);
    }
  };

  // Function to handle when the user clicks on "Mark as Active" from the modal
  const handleMarkAsActive = (index) => {
    const task = listContent[index];
    if (!activeTasks.includes(task) && !completedTasks.includes(task)) {
      setActiveTasks((prevTasks) => [...prevTasks, task]);
    }
    closeTaskActions();
  };

  // Function to handle when the user clicks on "Mark as Completed" from the modal
  const handleMarkAsCompleted = (index) => {
    const task = activeTab === "all" ? listContent[index] : activeTasks[index];

    if (!completedTasks.includes(task)) {
      setCompletedTasks((prevTasks) => [...prevTasks, task]);
      if (activeTab === "active") {
        handleDeleteActiveTask(index);
      }
    }
    closeTaskActions();
  };

  // Function to handle when the user clicks on "Delete" from the modal
  const handleDeleteTask = (index) => {
    setListContent((prevContent) => prevContent.filter((_, i) => i !== index));
    closeTaskActions();
  };

  // Function to handle when the user clicks on "Delete" from the modal in the active tab
  const handleDeleteActiveTask = (index) => {
    setActiveTasks((prevContent) => prevContent.filter((_, i) => i !== index));
    closeTaskActions();
  };

  // Function to handle when the user clicks on "Delete" from the modal in the completed tab
  const handleDeleteCompletedTask = (index) => {
    setCompletedTasks((prevContent) =>
      prevContent.filter((_, i) => i !== index)
    );
    closeTaskActions();
  };

  // Function to handle the input checkbox
  const handleCheckboxChange = (index) => {
    if (selectedTasks.includes(index)) {
      setSelectedTasks((prev) => prev.filter((i) => i !== index));
    } else {
      setSelectedTasks((prev) => [...prev, index]);
    }
  };

  // Function to handle all checkbox change
  const handleAllCheckboxChange = () => {
    if (allChecked) {
      setSelectedTasks([]);
    } else {
      const tasksToSelect = getTasksForCurrentTab().map((_, index) => index);
      setSelectedTasks(tasksToSelect);
    }
    setAllChecked(!allChecked);
  };

  // Function to handle bulk delete
  const handleBulkDelete = () => {
    const tasksToDelete = getTasksForCurrentTab().filter((_, index) =>
      selectedTasks.includes(index)
    );

    switch (activeTab) {
      case "all":
        setListContent((prevContent) =>
          prevContent.filter((task) => !tasksToDelete.includes(task))
        );
        setActiveTasks((prevActive) =>
          prevActive.filter((task) => !tasksToDelete.includes(task))
        );
        setCompletedTasks((prevCompleted) =>
          prevCompleted.filter((task) => !tasksToDelete.includes(task))
        );
        break;
      case "active":
        setActiveTasks((prevActive) =>
          prevActive.filter((task) => !tasksToDelete.includes(task))
        );
        break;
      case "completed":
        setCompletedTasks((prevCompleted) =>
          prevCompleted.filter((task) => !tasksToDelete.includes(task))
        );
        break;
      default:
        break;
    }

    setSelectedTasks([]);
    setAllChecked(false);
  };

  // Function to handle bulk "Mark as Active"
  const handleBulkMarkAsActive = () => {
    const tasksToMark = getTasksForCurrentTab().filter((_, index) =>
      selectedTasks.includes(index)
    );
    tasksToMark.forEach((task, index) => {
      const listIndex = listContent.indexOf(task);
      if (listIndex !== -1 && !completedTasks.includes(task)) {
        handleMarkAsActive(listIndex);
      }
    });
    setSelectedTasks([]);
    setAllChecked(false);
  };

  // Function to handle bulk "Mark as Completed"
  const handleBulkMarkAsCompleted = () => {
    const tasksToMark = getTasksForCurrentTab().filter((_, index) =>
      selectedTasks.includes(index)
    );
    tasksToMark.forEach((task, index) => {
      const taskIndex =
        activeTab === "all"
          ? listContent.indexOf(task)
          : activeTasks.indexOf(task);
      handleMarkAsCompleted(taskIndex);
    });
    setSelectedTasks([]);
    setAllChecked(false);
  };

  const getTasksForCurrentTab = () => {
    switch (activeTab) {
      case "all":
        return listContent;
      case "active":
        return activeTasks;
      case "completed":
        return completedTasks;
      default:
        return [];
    }
  };

  // Function to close all task action modals
  const closeTaskActions = () => {
    setShowTaskActions(false);
    setSelectedTaskIndex(null);
  };

  return (
    <div>
      <header>
        <p>Taskio</p>
        <a href="http://github.com/theCephas">github</a>
      </header>

      <section className="formSect">
        <form onSubmit={handleClick}>
          <input
            type="text"
            value={inputText}
            onChange={handleChange}
            placeholder="Add tasks here"
          />
          <button type="submit">Add Task</button>
        </form>
      </section>

      <div className="tabSect">
        <div className="tabBtns">
          <input
            type="checkbox"
            className="checkbox"
            checked={allChecked}
            onChange={handleAllCheckboxChange}
          />
          <button
            className={`${activeTab === "all" ? "activeTab" : ""}`}
            onClick={() => handleTabClick("all")}
          >
            All
          </button>
          <button
            className={`${activeTab === "active" ? "activeTab" : ""}`}
            onClick={() => handleTabClick("active")}
          >
            Active
          </button>
          <button
            className={`${activeTab === "completed" ? "activeTab" : ""}`}
            onClick={() => handleTabClick("completed")}
          >
            Completed
          </button>
        </div>

        <div className="eachTabSect">
          {activeTab === "all" && (
            <div className="eachTab">
              {listContent.length < 1 ? (
                <div className="noTasks">
                  <ClipboardList size={200} />
                  <p>Hey!👋</p>
                  <p>You have no tasks for now!</p>
                </div>
              ) : (
                <>
                  {allChecked && (
                    <div className="bulkActions">
                      <button onClick={handleBulkMarkAsActive}>
                        Mark as Active
                      </button>
                      <button onClick={handleBulkMarkAsCompleted}>
                        Mark as Completed
                      </button>
                      <div onClick={handleBulkDelete}>
                        <Trash2 />
                      </div>
                    </div>
                  )}

                  {listContent.map((items, index) => (
                    <div className="eachTabContent" key={index}>
                      <div>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedTasks.includes(index)}
                          onChange={() => handleCheckboxChange(index)}
                        />
                        <p>{items}</p>
                      </div>
                      <div
                        onClick={() => toggleTaskActions(index)}
                        className="ellipsis"
                      >
                        <EllipsisVertical size={30} />
                        {showTaskActions && selectedTaskIndex === index && (
                          <div className="taskActions">
                            <p onClick={() => handleMarkAsActive(index)}>
                              Mark as Active
                            </p>
                            <p onClick={() => handleMarkAsCompleted(index)}>
                              Mark as Completed
                            </p>
                            <p onClick={() => handleDeleteTask(index)}>
                              Delete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === "active" && (
            <div className="eachTab">
              {activeTasks.length < 1 ? (
                <div className="noTasks">
                  <ClipboardList size={200} />
                  <p>Hey!👋</p>
                  <p>You have no active tasks for now!</p>
                </div>
              ) : (
                <>
                  {allChecked && (
                    <div className="bulkActions">
                      <button onClick={handleBulkMarkAsCompleted}>
                        Mark as Completed
                      </button>
                    </div>
                  )}
                  {activeTasks.map((task, index) => (
                    <div className="eachTabContent" key={index}>
                      <div>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedTasks.includes(index)}
                          onChange={() => handleCheckboxChange(index)}
                        />
                        <p>{task}</p>
                      </div>
                      <div
                        onClick={() => toggleTaskActions(index)}
                        className="ellipsis"
                      >
                        <EllipsisVertical size={30} />
                        {showTaskActions && selectedTaskIndex === index && (
                          <div className="taskActions">
                            <p onClick={() => handleMarkAsCompleted(index)}>
                              Mark as Completed
                            </p>
                            <p onClick={() => handleDeleteActiveTask(index)}>
                              Delete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="eachTab">
              {completedTasks.length < 1 ? (
                <div className="noTasks">
                  <ClipboardList size={200} />
                  <p>Hey!👋</p>
                  <p>Sadly, you have no completed tasks!</p>
                </div>
              ) : (
                <>
                  {allChecked && (
                    <div className="bulkActions">
                      <div onClick={handleBulkDelete}>
                        <Trash2 />
                      </div>
                    </div>
                  )}
                  {completedTasks.map((task, index) => {
                    return (
                      <div className="eachTabContent" key={index}>
                        <div>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedTasks.includes(index)}
                            onChange={() => handleCheckboxChange(index)}
                          />
                          <p>{task}</p>
                        </div>
                        <div onClick={() => handleDeleteCompletedTask(index)}>
                          <Trash2 />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
