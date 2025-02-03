const {v4: uuidv4} = require('uuid');

// these livecycle hooks are only triggered, when called via the document api. Creating user via the ui, does not work.
export default {
    beforeCreate(event) {
        event.params.data.token = uuidv4();
    }
}
