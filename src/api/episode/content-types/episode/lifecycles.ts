export default {
    beforeCreate(event) {
        event.params.data.guid = crypto.randomUUID();
    },
    afterCreate(event) {
        const {result, params} = event;

        console.log("afterCreate - episode result", result);

        // do something to the result;
    },

    afterUpdate(event) {
        const {result, params} = event;

        console.log("afterUpdate - episode result", result);

        // do something to the result;
    },
};
