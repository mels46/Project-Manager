$(document).ready(()=>{
    $("#modal-button").click(()=>{
        const currentUrl = window.location.href;
        const userId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
        $(".modal-body").html('');
        $.get(`http://localhost:3000/api/tasks/${userId}`,(results={})=>{
            console.log(results);
            let data=results.data;
            if(!data ||  !Array.isArray(data.tasks)) return;
            data.tasks.forEach(task=>{

                $(".modal-body").append(
                   ` <div class="modal-b">
                        <span class="task-title s">
                            <a href="http://localhost:3000/task/${task._id}"> Naziv zadatka: ${task.naziv}</a>
                        </span>
                      
                        <div class="task-description s">
                           Opis:  ${task.opis}
                        </div>
                        <div class="task-worker s">
                           Radnik:  ${task.radnikIme}
                        </div>
                        <button class="editButton"><a href="http://localhost:3000/task/${task._id}/newDay">Uredi zadatak</a></button>
                        
                    </div>`
                );
            });
        });
    });
});

function preusmjeri(url) {
    // Preusmjeravanje na zadani URL
    window.location.href = url;
};

