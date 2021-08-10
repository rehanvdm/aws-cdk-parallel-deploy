exports.handler = async (event, context) =>
{
    console.log("SERVICE A", process.env.DYN_TABLE_NAME);
};
