export default {
    beforeCreate(event) {
        event.params.data.guid = crypto.randomUUID();
    }
};
