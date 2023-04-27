const ParsedBlock = (type, content) => {
    switch(type) {
        case "mark":
            return <mark>{content}</mark>;
        case "suggestion":
            return <mark className="suggestion">{content}</mark>;
        default:
            return <span>{content}</span>;
    }
}

export default ParsedBlock;