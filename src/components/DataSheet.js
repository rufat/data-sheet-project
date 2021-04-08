import '../stylings/DataSheet.css';
import { useRef, useState } from "react";
import useOutsideClick from "@rooks/use-outside-click";

function DataSheet({ data, onSubmit }) {
    const pRef = useRef();
    const [dummyData, setDummyData] = useState(data);
    
    const [searchValue, setSearchValue] = useState('');
    const [currentEditedValue, setCurrentEditedValue] = useState('');

    const [selected, setSelected] = useState({
        row: null,
        column: null
    });

    const [editable, setEditable] = useState({
        row: null,
        column: null
    });

    // This hook looks for outside click. If there are any click, then dismiss the active cell.
    useOutsideClick(pRef, deSelectCell);

    // Iterate alphabetic letters for the top columns of sheets.
    function nextChar(i) {
        const ch = 65 + i;
        if(ch > 90) return i;
        return String.fromCharCode(ch);
    }

    // Reset the state of editable / selected cell and search input.
    function deSelectCell() {
        setEditable({
            row: null,
            column: null
        });
        setSelected({
            row: null,
            column: null
        });
        setCurrentEditedValue('');
    }

    // Append the new data into state to update the specific (row, column) cell.
    function updateCell(row, column) {
        setDummyData(prev => prev.map((p, i) => i === row ? {
            ...p,
            [column]: currentEditedValue
        } : p));
    }

    const columnSelected = (row, column) => {
        // Dismiss selected active cell.
        setSelected({
            row,
            column,
        });

        // Dismiss editable cell If is not selected previously.
        if (editable.row !== row && editable.column !== column) {
            setEditable({
                row: null,
                column: null
            });
        }
    }

    // Highlight the cell and make it able to become editable by passing it's row and column positions.
    const editCell = (row, column, value) => {
        setCurrentEditedValue(value);
        setEditable({
            row,
            column,
        });
        setSelected({
            row,
            column,
        });
    }

    // Append the updated cell data to specify it as deleted. The value of 'deleted' can be false for undoing the deletion.
    // This function receives row position and canUndo arguments.
    const deleteCell = (row, canUndo = false) => {
        setDummyData(prev => prev.map((p, i) => i === row ? {
            ...p,
            deleted: !canUndo
        } : p));
        deSelectCell();
    }

    // If the 'Enter' key is pressed then update the cell and also de-select it.
    const onEnter = (row, column) => {
        updateCell(row, column);
        deSelectCell();
    }

    // Reset the changes on the datasheed by setting the initial <data> provided by parent component as props.
    const reset = () => {
        setDummyData(data);
        setSearchValue('');
    }

    // Filter the updated and deleted records of datasheet and then pass it with onSubmit prop<Function> to the parent component.
    const submit = () => {
        // Duplicate the <Array> variable with JSON parse/stringy methods to avoid references.
        let submitDummy = JSON.parse(JSON.stringify(dummyData));

        let updated = [];
        let deleted = [];

        for(let x = 0; x < submitDummy.length; x++) {
            // If the record is stated as "deleted", then ignore the updates and add to the deleted list array.
            if(submitDummy[x].deleted === true) {
                submitDummy[x].deleted = false;
                deleted.push(submitDummy[x]);
            } else {
                for(let d in submitDummy[x]) {
                    // Iterate the properties of two data to detect any changes.
                    if(submitDummy[x][d] !== data[x][d]) {
                        // To prevent double records, check for it by id.
                        const f = updated.find(f => f.id === submitDummy[x].id);
                        if(!f) updated.push(submitDummy[x]);
                    }
                }
            }
        }

        onSubmit({
            updated,
            deleted
        });
    }

    const searchCell = (s) => {
        const regex = new RegExp(searchValue, 'gmui')
        return s.match(regex) !== null;
    }

    return (
        <div>
            <div className={'actions-container'}>
                <button onClick={reset}>Reset</button>
                <button onClick={submit} style={{marginLeft: 10}}>Submit data</button>
            </div>
            <div className={'sheet-container'}>
                <input placeholder={'Search...'} style={{marginBottom: 10}} onChange={e =>  setSearchValue(e.target.value)} />
                <span className="data-grid-container">
                    <table className="data-grid">
                        <tbody>
                            <tr>
                                <td className="cell read-only"><span className="value-viewer"></span></td>
                                {
                                    [...dummyData, {}].map((l, i) => (
                                        <td key={'l_' + l.id} className="cell read-only">
                                            <span className="value-viewer">{nextChar(i)}</span>
                                        </td>
                                    ))
                                }
                                <td className="cell read-only">
                                    <span className="value-viewer">Actions</span>
                                </td>
                            </tr>
                            {
                                dummyData.map((d, i) => {
                                    const columns = Object.keys(d);
                                    
                                    // Check for search value.
                                    if(searchValue.length > 0) {
                                        let isFound = false;
                                        for(let x in columns) {
                                            // Look up for matches.
                                            isFound = searchCell(d[columns[x]].toString());
                                            if(isFound) break; // If found, don't continue to the iteration.
                                        }
                                        if(!isFound) return null; // If not found, do not render.
                                    }

                                    return (
                                        <tr key={d.id}>
                                            <td className={"cell read-only"}><span className="value-viewer">{i + 1}</span></td>
                                            {
                                                columns.map(v => {
                                                    // Check If cell is selected.
                                                    const isSelected = selected.row === i && selected.column === v;
                                                    // Check If cell is double clicked to become editable.
                                                    const isEditable = editable.row === i && editable.column === v;
                                                    // Check If cell is deleted.
                                                    const isDeleted = d?.deleted === true;
                                                    
                                                    // Do not iterate ID and Deleted properties to prevent from rendering them.
                                                    if (v === 'id' || v === 'deleted') return null;

                                                    return <td
                                                        key={d.id + v}
                                                        ref={isSelected && !isEditable ? pRef : null}
                                                        className={`cell ${isSelected ? 'selected' : ''}`}
                                                        style={d.deleted ? { backgroundColor: '#ececec' } : null}
                                                    >
                                                        <span
                                                            className={'value-viewer'}
                                                            style={{color: isDeleted && '#b1b1b1'}}
                                                            onDoubleClick={() => !isDeleted && editCell(i, v, d[v])}
                                                            onClick={() => !isDeleted && columnSelected(i, v)}
                                                        >
                                                            {isEditable ? <input
                                                                ref={pRef}
                                                                value={currentEditedValue}
                                                                onChange={e => setCurrentEditedValue(e.target.value)}
                                                                onKeyUp={e => e.code === 'Enter' && onEnter(i, v)}
                                                                autoFocus
                                                            /> : d[v]}
                                                        </span>
                                                    </td>
                                                })
                                            }
                                            <td className={'row-actions'}>
                                                <button
                                                    className={'row-action-button'}
                                                    onClick={() => deleteCell(i, d.deleted)}
                                                >
                                                    {!d.deleted ? 'Delete' : 'Undo'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </span>
            </div>
        </div>
    );
}

export default DataSheet;