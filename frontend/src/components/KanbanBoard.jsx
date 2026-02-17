import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import "./KanbanBoard.css";

const socket = io("http://localhost:5000");

const COLUMNS = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done"
};

const PRIORITIES = ["Low", "Medium", "High"];
const CATEGORIES = ["Bug", "Feature", "Enhancement"];

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    socket.on("sync:tasks", (data) => setTasks(data));

    socket.on("task:updated", () => toast.success("Task Updated!", { icon: '📝' }));
    socket.on("task:deleted", () => toast.error("Task Deleted!", { icon: '🗑️' }));

    socket.emit("sync:tasks");
    return () => {
      socket.off("sync:tasks");
      socket.off("task:updated");
      socket.off("task:deleted");
    };
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit("task:create", { text: input });
    setInput("");
    toast.success("Task Created! 🚀");
  };

  const deleteTask = (id) => {
    socket.emit("task:delete", id);
    toast.error("Removing task...", { duration: 800 }); 
  };

  const updateTask = (id, field, value) => {
    socket.emit("task:update", { id, [field]: value });
    toast.success(`${field} updated!`, { duration: 800 });
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Requirement: To Do se direct Done nahi ja sakte
    if (source.droppableId === "todo" && destination.droppableId === "done") {
      toast.error("Move to 'In Progress' first!", { icon: '🚫' });
      return; 
    }

    socket.emit("task:move", { 
      id: draggableId, 
      status: destination.droppableId 
    });

    const updatedTasks = tasks.map(t => 
      t.id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setTasks(updatedTasks);
  };

  const handleFileUpload = (e, taskId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Max 2MB allowed");
      const fileUrl = URL.createObjectURL(file);
      const newFile = { id: Date.now().toString(), url: fileUrl, name: file.name, type: file.type };
      const currentTask = tasks.find(t => t.id === taskId);
      socket.emit("task:update", { 
        id: taskId, 
        attachments: [...(currentTask.attachments || []), newFile] 
      });
      toast.success("File attached! 📎");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = (t.text || "").toLowerCase().includes(search.toLowerCase());
    const matchesPrio = priorityFilter === "All" || t.priority === priorityFilter;
    return matchesSearch && matchesPrio;
  });

  const chartData = Object.keys(COLUMNS).map(key => ({
    name: COLUMNS[key],
    count: tasks.filter(t => t.status === key).length
  }));

  return (
    <div className="board-wrapper">
      <Toaster position="top-right" reverseOrder={false} />

      <header className="top-bar">
        <h1>Kanban Pro</h1>
        <div className="filters-container">
          <input className="search-input" placeholder="🔍 Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <form onSubmit={addTask} className="input-box">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="New task..." />
          <button type="submit">Add Task</button>
        </form>
      </header>

      <div className="stats-section">
        <div className="chart-container" style={{ height: '140px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="count" barSize={15}>
                {chartData.map((e, i) => <Cell key={i} fill={i === 2 ? '#10b981' : '#6366f1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns-container">
          {Object.entries(COLUMNS).map(([colId, colName]) => (
            <div className="column" key={colId}>
              <div className="column-header">
                <h3>{colName} <span className="badge">{filteredTasks.filter(t => t.status === colId).length}</span></h3>
              </div>
              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <div className={`task-list ${snapshot.isDraggingOver ? "active-col" : ""}`} {...provided.droppableProps} ref={provided.innerRef}>
                    {filteredTasks.filter(t => t.status === colId).map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(provided, snapshot) => (
                          <div className={`task-card prio-${task.priority || 'Medium'} ${snapshot.isDragging ? "dragging" : ""}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <div className="task-main">
                              <span className="task-text">{task.text}</span>
                              <button className="del-btn" onClick={() => deleteTask(task.id)}>×</button>
                            </div>

                            <div className="attachment-section">
                              <input type="file" id={`file-${task.id}`} onChange={(e) => handleFileUpload(e, task.id)} style={{ display: 'none' }} />
                              <label htmlFor={`file-${task.id}`} className="file-label-btn">📎 Add File</label>
                              <div className="previews-grid">
                                {task.attachments?.map((file) => (
                                  <div key={file.id} className="preview-item" onClick={() => window.open(file.url, '_blank')}>
                                    {file.type?.includes("image") ? (
                                      <img src={file.url} alt="preview" className="thumb" />
                                    ) : (
                                      <div className="file-icon">{file.name.endsWith('.pdf') ? '📕' : '📄'}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="task-selectors">
                              <select 
                                value={task.priority || "Medium"} 
                                onChange={(e) => updateTask(task.id, 'priority', e.target.value)}
                              >
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <select 
                                value={task.category || "Feature"} 
                                onChange={(e) => updateTask(task.id, 'category', e.target.value)}
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;