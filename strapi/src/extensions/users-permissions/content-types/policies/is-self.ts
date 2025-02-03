export default (policyContext, config, {strapi}) => {
    console.log("is-self-policy");
    const {id} = policyContext.params
    const user = policyContext.state.user

    if (!user) {
        return false
    }

    return user.id.toString() === id.toString();
};
