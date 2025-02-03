export default {
    beforeCreate(event) {
        console.log("beforeCreate");
        const {data, where, select, populate} = event.params;
    },

    afterCreate(event) {
        console.log("afterCreate");

        const {result, params} = event;

        // do something to the result;
    },
};
