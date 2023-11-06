import { BsFillInfoCircleFill } from "react-icons/bs"
import { useEffect, useState } from "react"
import Modal from "react-modal";
import axios from "axios";

const repo = []

const EDITABLE = ["true", "t", 1].includes(process.env.REACT_APP_TOOLTIP_EDIT.toLocaleLowerCase())
const VISIBLE = ["true", "t", 1].includes(process.env.REACT_APP_TOOLTIP_VISIBLE.toLocaleLowerCase())
const TOOLTIP_BASE_URL = process.env.REACT_APP_TOOLTIP_BASE_URL || "http://localhost:5000"


function Tag(props) {

    const [tags, setTags] = useState({})
    const [newTag, setNewTag] = useState("")
    const [originalTags, setOriginalTags] = useState({})

    useEffect(async () => {
        getTags()
    }, [])

    async function handleCreateTag() {

        await axios.post(`${TOOLTIP_BASE_URL}/tag`, { "description": newTag })
        getTags()
        setNewTag("")
    }

    async function getTags() {

        let o = {}
        // Get all tags.
        let res = await axios.get(`${TOOLTIP_BASE_URL}/tag`)
        res.data["tags"].forEach(tag => o[tag['id']] = { 'description': tag['description'], 'checked': false })

        // Get checked tags.
        res = await axios.get(`${TOOLTIP_BASE_URL}/documentation/${props.uc_id}/tag`)
        for (let tag of res.data['tags'])
            o[tag['tag_id']]['checked'] = true

        setTags(o)
        setOriginalTags({ ...o })
    }

    function getUpdates(newTags) {

        const updates = {}
        for (let key in originalTags)
            if (originalTags[key]['checked'] !== newTags[key]['checked'])
                updates[key] = newTags[key]['checked']

        return updates
    }

    function handleTagClick(tagId) {
        let n = {}
        for (let tag in tags) n[tag] = { ...tags[tag] }
        n[tagId]['checked'] = !n[tagId]['checked']
        setTags(n)
        props.setUpdates(getUpdates(n))
    }


    return (

        <div>
            <form>
                {
                    Object.keys(tags).map((tag, indx) => (
                        <span style={{ border: "1px solid", marginRight: "5px", borderRadius: "2px", key: indx }}>
                            <input type="checkbox" disabled={!EDITABLE} checked={tags[tag]['checked'] ? 'checked' : ''}
                                onClick={(e) => handleTagClick(tag)} />
                            <p style={{ display: "inline-block" }}>{tags[tag]['description']}</p>
                        </span>))
                }
            </form>
            <form onSubmit={(e) => {
                handleCreateTag()
                e.preventDefault()
            }}>
                <input type="text" onChange={(e) => setNewTag(e.target.value)} value={newTag} disabled={!EDITABLE} />
                <input type="submit" value="add" disabled={!EDITABLE} />
            </form>
        </div>
    )

}


function UserControl(props) {

    const [modalOpen, setModalOpen] = useState(false)
    const [documentation, setDocumentation] = useState("")
    const [location, setLocation] = useState("")
    const [tagUpdates, setTagUpdates] = useState({})
    const isAnnotated = props.tag != null;

    let tag;
    const customStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
        },
    };

    if (isAnnotated) {
        if (!(props.tag in repo))
            repo.push(props.tag)
        tag = props.tag
    } else {
        tag = (repo.sort()[repo.length - 1] || 0) + 1
    }

    useEffect(async () => {
        let res = await axios.get(`${TOOLTIP_BASE_URL}/documentation/${tag}`)
        setDocumentation(res.data["description"])
        setLocation(res.data["location"])
    }, [modalOpen])

    function handleSubmitModal() {
        axios.post(`${TOOLTIP_BASE_URL}/documentation/${tag}`, {
            description: documentation,
            location: location
        }, { headers: { "Content-Type": "application/json" } })

        axios.post(`${TOOLTIP_BASE_URL}/documentation/${tag}/tag`, {
            tags: Object.entries(tagUpdates).filter(e => e[1] === true).map(e => e[0])
        })
        axios.patch(`${TOOLTIP_BASE_URL}/documentation/${tag}/tag`, {
            tags: Object.entries(tagUpdates).filter(e => e[1] === false).map(e => e[0])
        })
        handleCloseModal()
    }

    function handleCloseModal() {
        setDocumentation("")
        setLocation("")
        setModalOpen(false)
    }


    function childrenDisplay() {
        if (props.children) {
            return (props.children)
        } else if (!VISIBLE) {
            return <BsFillInfoCircleFill />
        }
    }

    return (
        <div style={{ display: "flex" }} title={documentation}>
            {childrenDisplay()}

            {VISIBLE &&
                <>
                    <BsFillInfoCircleFill style={{ cursor: "pointer", color: isAnnotated ? "green" : "red" }}
                        onClick={() => setModalOpen(true)} />

                    <Modal
                        isOpen={modalOpen}
                        style={customStyles}
                    >
                        <div style={{ display: "flex", flexDirection: "column" }}>

                            <div style={{ flexDirection: "row" }}>
                                {isAnnotated ? <div>id #{props.tag}</div> : <div>{`Sign with tag={${tag}}`}</div>}
                            </div>
                            {isAnnotated &&
                                (<div>
                                    <h4>Description</h4>
                                    <textarea type="text"
                                        disabled={!EDITABLE}
                                        style={{
                                            width: "400px",
                                            height: "200px"
                                        }} onChange={(e) => setDocumentation(e.target.value)} value={documentation} />
                                    <h4>Location</h4>
                                    <textarea type="text"
                                        disabled={!EDITABLE}
                                        style={{
                                            width: "400px",
                                            height: "80px"
                                        }} onChange={(e) => setLocation(e.target.value)} value={location} />
                                    <h4>Tags</h4>
                                    <Tag uc_id={tag} setUpdates={setTagUpdates} />
                                </div>)
                            }
                            <div style={{ margin: "10px" }} />
                            {isAnnotated && EDITABLE && <button onClick={() => handleSubmitModal()}>Submit</button>}
                            <button onClick={() => handleCloseModal()}>Close</button>

                        </div>
                    </Modal>
                </>
            }
        </div>
    )
}

export default UserControl