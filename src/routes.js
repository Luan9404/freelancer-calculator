const express = require('express')
const routes = express.Router()

const views = __dirname+'/views' 

Profile = {
    data: {
        name : 'Luan Oliveira',
        avatar: 'https://avatars.githubusercontent.com/u/81184443?v=4',
        'monthly-budget' : 3000,
        'hours-per-day' : 5,
        'days-per-week' : 5,
        'vacation-per-year': 4,
        'hours-value': 75
    },
    controllers: {
        index(req,res){
            return res.render(views + "/profile",{profile: Profile.data})
        },

    }

}

const Job = {
    data: [
        {
            id: 1,
            name: "Pizzaria Guloso",
            'total-hours': 1,
            'daily-hours': 2,
            created_at: Date.now(),
        },
        {
            id: 2,
            name: "OneTwo Project",
            'total-hours': 47,
            'daily-hours': 3,
            created_at: Date.now(),
        }
    ],
    controllers:{
        index(req, res){
            const updatedJobs = Job.data.map((job) => {
                const remaining = Job.services.remainingDays(job);
                const status = remaining <= 0 ? 'done' : 'progress';
        
                return {
                    ...job,
                    remaining,
                    status,
                    budget : Profile.data['hours-value']*job['total-hours'],
                }
        
            })
            return res.render(views + "/index",{profile: Profile.data, jobs: updatedJobs})
        },
        save(req,res){
            const lastId = Job.data[Job.data.length - 1]?.id || 1;

            Job.data.push( {
                id: lastId +1,
                name: req.body.name,
                'daily-hours': req.body['daily-hours'],
                'total-hours': req.body['total-hours'],
                created_at: Date.now(),
            })
        return res.redirect('/');
        },
        create(req,res){
            return res.render(views + "/job")
        }    
    },
    services:{
        remainingDays(jobs){
            // calcula os dias restantes
            
            const remainingDays = (jobs['total-hours'] / jobs['daily-hours']).toFixed()
            const createdDate = new Date(jobs.created_at)  
            
            const dueDay = createdDate.getDate() + Number(remainingDays);
            
            const dueDateInMs = createdDate.setDate(dueDay);
        
            const timeDiffInMs = dueDateInMs - Date.now();
        
            const dayInMs = 1000 * 60 * 60 * 24;
        
            const dayDiff = Math.floor(timeDiffInMs / dayInMs);
            return dayDiff;
        },
    }
}



routes.get('/', Job.controllers.index)
routes.get('/job',Job.controllers.create)
routes.post('/job', Job.controllers.save)
routes.get('/job-edit', (req,res) =>  res.render(views + "/job-edit"))
routes.get('/profile', Profile.controllers.index);



module.exports = routes;