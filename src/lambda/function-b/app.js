exports.handler = async (event, context) =>
{
    console.log("SERVICE B", process.env.DYN_TABLE_NAME);
};
