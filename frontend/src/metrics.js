import { BsFillInfoCircleFill } from 'react-icons/bs'
import { useEffect, useState } from 'react'
import Modal from 'react-modal';
import axios from 'axios';

const repo = []

const DEVELOPMENT = true


function MetricsTag(props) {

    const [modalOpen, setModalOpen] = useState(false)
    const [documentation, setDocumentation] = useState("")
    let isAnotated = props.tag != null;
    let tag;
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };

    if (isAnotated) {
        if (!(props.tag in repo))
            repo.push(props.tag)
        tag = props.tag
    } else {
        tag = (repo.sort()[repo.length - 1] || 0) + 1
    }


    useEffect(async () => {


        let res = await axios.get(`http://localhost:5000/documentation/${tag}`)
        setDocumentation(res.data)

    }, [modalOpen])


    function handleSubmitModal() {

        axios.post(`http://localhost:5000/documentation/${tag}`, { description: documentation }, { headers: { 'Content-Type': 'application/json' } })
        handleCloseModal()
    }

    function handleCloseModal() {
        setDocumentation("")
        setModalOpen("")
    }


    let styleTag = isAnotated ? { cursor: "pointer", color: "green" } : { cursor: "pointer", color: "red" }

    return (
        <div style={{ display: 'flex' }}>
            {props.children}

            {DEVELOPMENT &&
                <>
                    <BsFillInfoCircleFill style={styleTag} onClick={() => setModalOpen(true)} />

                    <Modal
                        isOpen={modalOpen}
                        style={customStyles}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>

                            <div style={{ flexDirection: 'row' }}>
                                {isAnotated ? <div>id #{props.tag}</div> : <div>{`Sign with tag={${tag}}`}</div>}

                            </div>

                            {isAnotated &&
                                (<div ><h4>Description</h4>
                                    <textarea type='text' style={{
                                        width: "400px",
                                        height: "200px"
                                    }} onChange={(e) => setDocumentation(e.target.value)} value={documentation} /></div>)
                            }


                            {isAnotated && <button onClick={() => handleSubmitModal()}>Submit</button>}
                            <button onClick={() => handleCloseModal()}>Close</button>

                        </div>
                    </Modal >
                </>
            }
        </div >
    )
}

export default MetricsTag