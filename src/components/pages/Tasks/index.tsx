import React, {useEffect, useState} from 'react';
import api from '../../../classes/Api';
import './style.css'
import Task from '../../molecules/Task'
import Toaster from "../../../classes/Toaster";
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.min.css'

interface TasksProps {
}

const Tasks = (props: TasksProps) => {
    const getDefaultDue = () => {
        const due = new Date();

        due.setDate(due.getDate() + 7);
        due.setHours(23);
        due.setMinutes(59);

        return due;
    };

    const [tasks, setTasks] = useState<Task[]>([]),
        [newTask, setNewTask] = useState<string>(''),
        [newDue, setNewDue] = useState<Date>(getDefaultDue()),
        [newCents, setNewCents] = useState<number>(500),
        [timezone, setTimezone] = useState<string>('');

    const toaster: Toaster = new Toaster();

    useEffect( () => {
        refreshData()
    }, []);

    const refreshData = async () => {
        const tasksResponse = await api.getTasks(),
            tasks = await tasksResponse.json(),
            meResponse = await api.getMe(),
            me = await meResponse.json();

        setTasks(tasks)
        setTimezone(me.timezone)
    };

    const saveTask = (event: any) => {
        event.preventDefault();

        if (!newTask) {
            toaster.send('Missing task description');
            return;
        }

        toaster.send('Adding task...');

        const dueString = newDue.toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });

        setTasks((prev) => [...prev, {
            complete: false,
            due: newDue,
            id: -1,
            cents: newCents,
            task: newTask,
            charge_authorized: null,
            charge_locked: null,
            charge_captured: null,
        }]);

        setNewTask('');

        api.addTask(newTask, dueString, newCents).then((res: any) => {
            toaster.send((res.ok) ? 'Task added' : 'Failed to add task');
            refreshData();
        });
    };

    const toggleStatus = (task: Task) => {
        const change = (task.complete ? 'incomplete' : 'complete');

        toaster.send(`Marking task ${change}...`);

        setTasks((prev: Task[]) => {
            return prev.map((t: Task) => {
                if (t.id === task.id) t.complete = !t.complete;
                return t;
            });
        });

        api.setComplete(task.id, !task.complete).then((res: any) => {
            res.text().then(console.log)
            toaster.send(res.ok ? `Successfully marked task ${change}`
                : `Failed to mark task ${change}`);
            refreshData()
        });
    };

    // TODO: Fix compare function
    const compareTasks = (a: Task, b: Task) => {
        const aDate = new Date(a.due),
            bDate = new Date(b.due);

        if (aDate < bDate) return -1;
        if (aDate > bDate) return 1;
        return 0;
    };

    const getSortedTasks = () => {
        return tasks.sort(compareTasks);
    };

    const getActiveTasks = () => {
        const tasks1 = getSortedTasks().filter((t: Task) => {
            return !t.complete && !t.charge_captured;
        });
        return tasks1;
    };

    const getArchivedTasks = () => {
        return getSortedTasks().filter((t: Task) => {
            return t.complete || t.charge_captured;
        });
    };

    const makeTaskListItems = (tasks: Task[]) => {
        return tasks.map(t => <li key={t.id}><Task task={t} onToggle={() => toggleStatus(t)}/></li>);
    };

    return <div className={'page-tasks'}>
        <h1>Tasks</h1>

        <form onSubmit={saveTask}>
            <div className="page-tasks__inputs">
                <label className={'page-tasks__description'}>Task <input
                    type="text"
                    placeholder={'Task'}
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                /></label>
                <label className={'page-tasks__due'}>Due {timezone ? <>(<a href={'https://docs.taskratchet.com/timezones.html'} target={'_blank'} rel={"noopener noreferrer"}>{timezone}</a>)</> : null} <DatePicker selected={newDue} onChange={(date: Date | null | undefined) => {
                    if (date) setNewDue(date);
                }} showTimeSelect timeIntervals={5} dateFormat="MMMM d, yyyy h:mm aa" minDate={new Date()} /></label>
                <label className={'page-tasks__dollars'}>Stakes <input
                    type="number"
                    placeholder={'USD'}
                    min={1}
                    max={2500}
                    value={newCents / 100}
                    onChange={(e: any) => setNewCents(e.target.value * 100)}
                /></label>
            </div>
            <input className={'page-tasks__addButton'} type="submit" value={'Add'}/>
        </form>

        <ul className={'page-tasks__list'}>{makeTaskListItems(getActiveTasks())}</ul>

        <label htmlFor="archive_toggle" className={'page-tasks__toggleLabel'}>Archived Tasks</label>
        <input type="checkbox" className={'page-tasks__toggleInput'} id="archive_toggle"/>

        <ul className={'page-tasks__list page-tasks__archive'}>{makeTaskListItems(getArchivedTasks())}</ul>
    </div>
};

export default Tasks;
