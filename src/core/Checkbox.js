import React,{ useState } from 'react'

const Checkbox = ({categories, handleFilters}) => {

    const [checked, setChecked] = useState([]);

    const handleToggle = c => () => {
        const currentCategoryId = checked.indexOf(c); // return the first indexof or -1
        const newCheckedCategoryId = [...checked];
        // if currently checked was not already in checked state > push
        // else pull/take off
        if (currentCategoryId === -1) {
            newCheckedCategoryId.push(c);
        } else {
            newCheckedCategoryId.splice(currentCategoryId, 1);
        }

        setChecked(newCheckedCategoryId);
        handleFilters(newCheckedCategoryId);
    }
    return categories.map((c, i) => (
        <li className="list-unstyled" key={i}>
            <input
                onChange={handleToggle(c._id)}
                value={checked.indexOf(c.indexOf === -1)}
                type="checkbox"
                className="form-check-input"
            />
            <label className="form-check-label">{c.name}</label>
        </li>
    ))
}

export default Checkbox
