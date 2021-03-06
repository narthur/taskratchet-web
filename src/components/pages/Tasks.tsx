import React from 'react';
import './Tasks.css'
import 'react-datepicker/dist/react-datepicker.min.css'
import {useTasks} from "../../lib/api";
import TaskEntry from "../organisms/TaskEntry";
import TaskList from "../organisms/TaskList";
import {useCloseWarning} from "../../lib/useCloseWarning";

const Tasks = () => {
    const {isLoading} = useTasks();

    useCloseWarning()

    return <div className={`page-tasks ${isLoading ? "loading" : "idle"}`}>
        <h1>Tasks</h1>

        <TaskEntry />
        <TaskList />
    </div>
};

export default Tasks;
